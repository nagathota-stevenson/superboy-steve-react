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
 const paid=status==='paid',refunded=status==='refunded';
 const title=paid?'Pocket is yours.':refunded?'Your purchase was refunded.':'Confirming your payment.';
 const description=paid?'Your purchase is verified. Choose the build for your setup below.':refunded?'Downloads are unavailable for refunded purchases. Contact support if this is unexpected.':'We’re securely confirming your purchase with Stripe. This usually takes only a moment.';
 return <main className="pk-page pk-success"><div className="pk-success-noise"/><header className="pk-success-nav"><a href="/pocket" className="pk-brand"><img src="/pocket/Branding/Pocket-logo.png" alt=""/>pocket<span>®</span></a><a className="pk-success-return" href="/pocket">Return to Pocket <span>↗</span></a></header><section className={'pk-success-shell pk-success-'+status}><div className="pk-success-mark" aria-hidden="true">{paid?<svg className="pk-success-check" viewBox="0 0 24 24"><path d="m5 12 4.2 4.2L19 6.8"/></svg>:<span/>}</div><div className="pk-eyebrow"><i/>{paid?'PURCHASE CONFIRMED':refunded?'PURCHASE STATUS':'SECURE CHECKOUT'}</div><h1>{title}</h1><p className="pk-success-intro">{description}</p>{paid&&<div className="pk-downloads"><article><div><span className="pk-download-number">01</span><h2>macOS</h2><p>VST3 + Audio Unit<br/>macOS 11 or later</p></div><button className="pk-button" onClick={()=>download('macos')} disabled={Boolean(busy)}>{busy==='macos'?'Preparing…':'Download for macOS'} <span>↓</span></button></article><article><div><span className="pk-download-number">02</span><h2>Windows</h2><p>VST3<br/>Windows 10 or later</p></div><button className="pk-button pk-button-secondary" onClick={()=>download('windows')} disabled={Boolean(busy)}>{busy==='windows'?'Preparing…':'Download for Windows'} <span>↓</span></button></article></div>}{paid&&<p className="pk-success-install">Your downloads are ready. macOS may request approval in <strong>System Settings → Privacy &amp; Security</strong> on first launch.</p>}{!paid&&!refunded&&<div className="pk-success-pulse"><i/><i/><i/></div>}<p className="pk-success-error" role="alert">{error}</p><p className="pk-success-help">Need help or a fresh download? <a href="mailto:nagathota.stevenson@gmail.com">Contact support</a> with your Stripe receipt. Do not send payment-card details.</p></section><footer className="pk-success-footer">MADE BY STEVENSON NAGATHOTA <span/> SPECTRAL SIDECHAIN DUCKING</footer></main>;
}
