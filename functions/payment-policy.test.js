import test from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {AMOUNT,paidSession} from './payment-policy.js';
const paid={mode:'payment',payment_status:'paid',amount_total:AMOUNT,currency:'usd',livemode:false,metadata:{product:'pocket-macos',order_id:'a'.repeat(64)},customer_details:{email:'test@example.com'}};
test('only exact paid Pocket orders pass',()=>{
 assert.equal(paidSession(paid,false),true);
 for(const change of [{amount_total:1},{currency:'eur'},{payment_status:'unpaid'},{livemode:true},{mode:'subscription'},{metadata:{product:'other'}}])
  assert.equal(paidSession({...paid,...change},false),false);
});
test('real Stripe signature verification rejects tampering',()=>{
 const stripe=new Stripe('sk_test_not_a_real_key'),secret='whsec_test_only';
 const payload=JSON.stringify({id:'evt_unit',type:'checkout.session.completed',data:{object:paid}});
 const signature=stripe.webhooks.generateTestHeaderString({payload,secret});
 assert.equal(stripe.webhooks.constructEvent(payload,signature,secret).id,'evt_unit');
 assert.throws(()=>stripe.webhooks.constructEvent(payload+' ',signature,secret));
 assert.throws(()=>stripe.webhooks.constructEvent(payload,signature,'wrong'));
});

