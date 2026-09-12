import React,{useState,useEffect} from 'react';
const STORE='pocket-purchase-token';
function token(create=false){
 let value=sessionStorage.getItem(STORE);
 if(!value&&create){value=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');sessionStorage.setItem(STORE,value);}
 return value;
}
async function api(path,method='GET',body){
 const t=token(path==='/checkout');if(!t)throw new Error('Open this page in the browser tab where you made your purchase, or contact support.');
 const r=await fetch('/api/pocket'+path,{method,headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'},...(method==='POST'?{body:JSON.stringify(body||{})}: {})});
 if(!r.headers.get('content-type')?.includes('application/json'))throw new Error('The checkout service is temporarily unavailable. Please try again shortly.');
 const j=await r.json().catch(()=>({error:'Checkout is temporarily unavailable.'}));
 if(r.status===410 && path==='/checkout')sessionStorage.removeItem(STORE);
 if(!r.ok)throw new Error(j.error||'Unable to complete this request.');return j;
}
export default function PocketPurchase(){
 const[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function buy(){if(busy)return;setBusy(true);setError('');try{const {url}=await api('/checkout','POST');if(new URL(url).hostname!=='checkout.stripe.com')throw new Error('Invalid checkout destination.');window.location.assign(url);}catch(e){setError(e.message);setBusy(false);}}
 return <section className="pk-purchase pk-section" id="buy"><div><div className="pk-eyebrow">POCKET</div><h2>Spectral Sidechain<br/><em>Ducking.</em></h2><p>Make space for what matters in your mix.</p></div><div className="pk-price-card"><div className="pk-price"><del>$39.99</del><strong>$19.99</strong><span>USD</span></div><p className="pk-discount">50% OFF: LAUNCH PRICE</p><button className="pk-button" onClick={buy} disabled={busy}>{busy?'Opening secure checkout…':'BUY POCKET | $19.99'}</button><p>Secure checkout powered by Stripe</p><small>macOS 11+ · VST3 + AU<br/>Windows · VST3</small><p className="pk-install-note">Pocket is independently funded while Apple certification is in progress. On first launch, macOS may ask you to approve it in <strong>System Settings → Privacy &amp; Security</strong>. Thank you for supporting the final certification.</p><p role="alert">{error}</p></div></section>;
}
export function PocketSuccess(){
 const[status,setStatus]=useState('pending'),[error,setError]=useState(''),[busy,setBusy]=useState('');
 useEffect(()=>{let stopped=false,timer,tries=0;const check=async()=>{try{const r=await api('/status');if(stopped)return;setStatus(r.status);if(r.status==='pending'&&++tries<60)timer=setTimeout(check,3000);}catch(e){if(!stopped)setError(e.message);}};check();return()=>{stopped=true;clearTimeout(timer);};},[]);
 async function download(platform){setBusy(platform);setError('');try{const{url}=await api('/download','POST',{platform});window.location.assign(url);}catch(e){setError(e.message);}finally{setBusy('');}}
 return <main className="pk-page pk-success"><a href="/pocket" className="pk-brand">pocket</a><h1>{status==='paid'?'Pocket is yours.':status==='refunded'?'Your purchase was refunded.':'Confirming your payment.'}</h1><p>{status==='paid'?'Your purchase has been verified. Download the build for your platform below.':status==='refunded'?'Downloads are unavailable for refunded purchases. Contact support if this is unexpected.':'This page waits for Stripe’s verified payment notification. Keep this tab open.'}</p>{status==='paid'&&<div className="pk-downloads"><button className="pk-button" onClick={()=>download('macos')} disabled={Boolean(busy)}>{busy==='macos'?'Preparing download…':'Download Pocket for macOS'}</button><button className="pk-button pk-button-secondary" onClick={()=>download('windows')} disabled={Boolean(busy)}>{busy==='windows'?'Preparing download…':'Download Pocket for Windows'}</button></div>}<p role="alert">{error}</p><p>Need help or a fresh download? <a href="mailto:nagathota.stevenson@gmail.com">Contact support</a> with your Stripe receipt. Do not send payment-card details.</p><a href="/pocket">Return to Pocket</a></main>;
}
