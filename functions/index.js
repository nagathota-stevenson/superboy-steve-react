import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import { createHash } from 'node:crypto';
import Stripe from 'stripe';
import { AMOUNT, PRODUCT, paidSession } from './payment-policy.js';
initializeApp({ databaseURL: 'https://superboysteve-e6cea-default-rtdb.firebaseio.com' });
const key=defineSecret('STRIPE_SECRET_KEY'), hook=defineSecret('STRIPE_WEBHOOK_SECRET');
const origin=defineString('POCKET_ORIGIN',{default:'https://superboysteve.com'});
const bucket=defineString('POCKET_BUCKET',{default:'superboysteve-e6cea.appspot.com'});
const archive=defineString('POCKET_ARCHIVE',{default:'SET_AFTER_PRIVATE_UPLOAD'});
const windowsArchive=defineString('POCKET_WINDOWS_ARCHIVE',{default:'SET_AFTER_PRIVATE_UPLOAD'});
const sha=s=>createHash('sha256').update(s).digest('hex');
const options={region:'us-central1',maxInstances:5,timeoutSeconds:60};
function stripe(){return new Stripe(key.value().trim());}
function orderId(req){const token=req.get('authorization')?.replace(/^Bearer /,'')||'';return /^[a-f0-9]{64}$/.test(token)?sha(token):null;}
function noCache(res){res.set('Cache-Control','private, no-store');res.set('Referrer-Policy','no-referrer');}
export const pocketApi=onRequest({...options,secrets:[key]},async(req,res)=>{
 noCache(res);
 const id=orderId(req), route=req.path.replace(/^\/api\/pocket/,'');
 if(!id)return res.status(401).json({error:'Purchase access token required.'});
 const db=getDatabase(),ref=db.ref('pocketOrders/'+id);
 try{
  if(route==='/checkout' && req.method==='POST'){
   if(req.get('origin')!==origin.value() || !req.is('application/json'))return res.status(403).json({error:'Invalid checkout request.'});
  if(archive.value()==='SET_AFTER_PRIVATE_UPLOAD'||windowsArchive.value()==='SET_AFTER_PRIVATE_UPLOAD')return res.status(503).json({error:'Downloads are not configured yet.'});
   // Verify deliverable exists before accepting money.
  const files=getStorage().bucket(bucket.value());
  const [[macExists],[windowsExists]]=await Promise.all([files.file(archive.value()).exists(),files.file(windowsArchive.value()).exists()]);
  if(!macExists||!windowsExists)return res.status(503).json({error:'Download is temporarily unavailable.'});
   const rate=db.ref('pocketCheckoutLimits/'+sha((req.ip||'unknown')+Math.floor(Date.now()/60000)));
   const limit=await rate.transaction(v=>(v?.count||0)>=10?undefined:{count:(v?.count||0)+1,expiresAt:Date.now()+86400000});
   if(!limit.committed)return res.status(429).json({error:'Please wait a minute before retrying.'});
   const prior=(await ref.get()).val();
   if(prior?.status==='paid')return res.status(409).json({error:'This purchase is already complete. Return to the success page.'});
   if(prior?.sessionId){const previous=await stripe().checkout.sessions.retrieve(prior.sessionId);if(previous.status==='expired')return res.status(410).json({error:'This checkout expired. Click Buy again to start a new checkout.'});}
   await ref.transaction(old=>old||{status:'pending',product:PRODUCT,amountExpected:AMOUNT,currency:'usd',createdAt:Date.now(),archive:archive.value()});
   const s=await stripe().checkout.sessions.create({
    mode:'payment',line_items:[{price_data:{currency:'usd',unit_amount:AMOUNT,product_data:{name:'Pocket | Spectral Sidechain Ducking Plugin',description:'macOS VST3 + AU and Windows VST3. Unsigned test builds. Launch purchase includes both platforms.'}},quantity:1}],
    payment_method_types:['card'],billing_address_collection:'auto',
    success_url:origin.value()+'/success',cancel_url:origin.value()+'/pocket#buy',
    metadata:{order_id:id,product:PRODUCT},payment_intent_data:{metadata:{order_id:id,product:PRODUCT}},
    custom_text:{submit:{message:'Includes unsigned macOS and Windows test builds. Manual security approval may be needed.'}}
   },{idempotencyKey:'pocket-'+id});
   await ref.update({sessionId:s.id});
   return res.json({url:s.url});
  }
  if(route==='/status' && req.method==='GET'){
   const order=(await ref.get()).val();
   return res.json({status:order?.status||'pending'});
  }
  if(route==='/download' && req.method==='POST'){
   if(req.get('origin')!==origin.value())return res.status(403).end();
  const platform=req.body?.platform;
  if(platform!=='macos'&&platform!=='windows')return res.status(400).json({error:'Choose a valid download platform.'});
   const order=(await ref.get()).val();
   if(order?.status!=='paid'||order.amountPaid!==AMOUNT||order.currency!=='usd')return res.status(403).json({error:'Payment has not been verified.'});
  // Recheck Stripe so a refunded purchase cannot mint new download URLs.
  const pi=await stripe().paymentIntents.retrieve(order.paymentIntent,{expand:['latest_charge']});
  if(pi.status!=='succeeded'||pi.latest_charge?.refunded||pi.latest_charge?.amount_refunded>0)return res.status(403).json({error:'Purchase is no longer eligible for download.'});
  const selectedArchive=platform==='windows'?windowsArchive.value():archive.value();
  const [exists]=await getStorage().bucket(bucket.value()).file(selectedArchive).exists();
  if(!exists)return res.status(503).json({error:'This download is temporarily unavailable.'});
  const [url]=await getStorage().bucket(bucket.value()).file(selectedArchive).getSignedUrl({
    version:'v4',action:'read',expires:Date.now()+5*60*1000,
   responseDisposition:`attachment; filename="Pocket-${platform==='windows'?'Windows':'macOS'}.zip"`
   });
   return res.json({url,expiresIn:300});
  }
  return res.status(404).end();
 }catch(err){console.error('Pocket API failure',err.type||err.code||'internal');return res.status(503).json({error:'Unable to complete this request. Please try again.'});}
});
export const pocketStripeWebhook=onRequest({...options,secrets:[key,hook]},async(req,res)=>{
 if(req.method!=='POST')return res.status(405).end();
 let event;
 try{event=stripe().webhooks.constructEvent(req.rawBody,req.get('stripe-signature'),hook.value().trim());}
 catch{return res.status(400).send('Invalid webhook signature');}
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))return res.json({received:true});
 const s=event.data.object;
 if(!paidSession(s,key.value().trim().startsWith('sk_live_')))return res.json({received:true});
 try{
  const ref=getDatabase().ref('pocketOrders/'+s.metadata.order_id);
  const result=await ref.transaction(order=>{
   if(!order||order.product!==PRODUCT||order.amountExpected!==AMOUNT||order.sessionId&&order.sessionId!==s.id)return;
   if(order.status==='paid')return order;
   return {...order,status:'paid',email:s.customer_details.email,sessionId:s.id,paymentIntent:s.payment_intent,
    paymentStatus:s.payment_status,amountPaid:s.amount_total,currency:s.currency,paidAt:Date.now(),stripeEventId:event.id,licenseKey:null};
  });
  if(!result.committed)return res.status(500).send('Order unavailable; retry required');
  return res.json({received:true});
 }catch{return res.status(500).send('Persistence failed; retry required');}
});

