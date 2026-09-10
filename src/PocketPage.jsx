import PocketPurchase from './components/PocketPurchase.jsx';
import { useEffect, useRef, useState } from 'react';
import PocketScene from './components/PocketScene.jsx';
import PocketDemos from './components/PocketDemos.jsx';
import PocketInterface3D from './components/PocketInterface3D.jsx';
import './pocket.css';

const Arrow = () => <span className="pk-arrow" aria-hidden="true">↗</span>;
const focusSignup = () => document.getElementById('pocket-email')?.focus({ preventScroll: true });

function SignupIcon({ status }) {
  if (status === 'saving') return <span className="pk-loading-bars" aria-hidden="true"><i /><i /><i /></span>;
  if (status === 'success') return <svg className="pk-success-check" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4 10-10" /></svg>;
  return <Arrow />;
}
function SignupForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (pending.current || status === 'success') return;
    if (new FormData(event.currentTarget).get('company')) return;
    pending.current = true; setStatus('saving'); setMessage('');
    try {
      const { joinPocketWaitlist } = await import('./lib/pocketWaitlist.js');
      await joinPocketWaitlist(email);
      setStatus('success'); setMessage('You’re on the list. We’ll email you when Pocket is ready.');
    } catch { setStatus('error'); setMessage('We couldn’t save your email. Please check your connection and try again.'); }
    finally { pending.current = false; }
  }
  return <form className="pk-signup" data-status={status} onSubmit={submit} aria-busy={status === 'saving'}>
    <label htmlFor="pocket-email">Email address</label>
    <div className="pk-input">
      <input id="pocket-email" name="email" type="email" autoComplete="email" placeholder="you@yourstudio.com" required maxLength={254} value={email} readOnly={status === 'saving' || status === 'success'} onInvalid={() => { setStatus('invalid'); setMessage('Enter a valid email address to join the waitlist.'); }} onChange={e => { setEmail(e.target.value); setStatus('idle'); setMessage(''); }} aria-invalid={status === 'invalid'} aria-describedby="signup-message" />
      <button className="pk-join-button" type="submit" disabled={status === 'saving' || status === 'success'}>
        <span className="pk-join-content" key={status}>
          <span>{status === 'saving' ? 'Saving your spot' : status === 'success' ? 'You’re on the list' : status === 'error' ? 'Try again' : 'Join the waitlist'}</span>
          <span className="pk-join-icon"><SignupIcon status={status} /></span>
        </span>
      </button>
    </div>
    <div className="pk-honeypot" aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
    <p id="signup-message" className={status === 'error' || status === 'invalid' ? 'pk-error' : ''} role="status" aria-live="polite">{message || 'By joining, you agree to receive Pocket launch news and development updates.'}</p>
  </form>;
}

export default function PocketPage() {
  const root = useRef(null);
  const [details, setDetails] = useState(false);
  useEffect(() => {
    const title = document.title;
    const description = 'Pocket is a spectral sidechain VST3 and Audio Unit plugin for macOS. Create space between competing sounds with frequency-dependent ducking and precise control.';
    const canonicalUrl = 'https://superboysteve.com/pocket';
    document.title = 'Pocket VST3 Plugin | Spectral Sidechain Ducking';
    const created = [];
    const setMeta = (attributes) => {
      const selector = attributes.name ? `meta[name="${attributes.name}"]` : `meta[property="${attributes.property}"]`;
      let element = document.head.querySelector(selector);
      if (!element) { element = document.createElement('meta'); document.head.appendChild(element); created.push(element); }
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    };
    setMeta({ name: 'description', content: description });
    setMeta({ name: 'author', content: 'Stevenson Nagathota' });
    setMeta({ name: 'keywords', content: 'Pocket VST, Pocket VST3, spectral sidechain plugin, sidechain ducking plugin, frequency dependent ducking, audio plugin' });
    setMeta({ property: 'og:type', content: 'website' });
    setMeta({ property: 'og:url', content: canonicalUrl });
    setMeta({ property: 'og:title', content: 'Pocket VST3 Plugin | Spectral Sidechain Ducking' });
    setMeta({ property: 'og:description', content: description });
    setMeta({ property: 'og:image', content: `${window.location.origin}/pocket/Pocket-1280.png` });
    setMeta({ name: 'twitter:card', content: 'summary_large_image' });
    setMeta({ name: 'twitter:title', content: 'Pocket VST3 Plugin | Spectral Sidechain Ducking' });
    setMeta({ name: 'twitter:description', content: description });
    setMeta({ name: 'twitter:image', content: `${window.location.origin}/pocket/Pocket-1280.png` });
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); created.push(canonical); }
    canonical.href = canonicalUrl;
    const schema = document.createElement('script');
    schema.id = 'pocket-software-schema'; schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Pocket',
      alternateName: 'Pocket VST3 Plugin',
      description,
      url: canonicalUrl,
      image: `${window.location.origin}/pocket/Pocket-1280.png`,
      author: { '@type': 'Person', name: 'Stevenson Nagathota', url: 'https://superboysteve.com' },
      applicationCategory: 'MultimediaApplication',
      applicationSubCategory: 'Audio plugin',
      operatingSystem: 'macOS 11 or later, Windows',
      softwareRequirements: 'VST3 or Audio Unit host for macOS; VST3 host for Windows',
      featureList: ['Spectral sidechain processing', 'Frequency-dependent ducking', 'Amount control', 'Attack and release', 'Low cut and high cut', 'Smoothing', 'Focus and sensitivity', 'Mix', 'Stereo, Mid only, Side only', 'Freeze', 'Delta', 'Listen'],
    });
    document.head.appendChild(schema);
    created.push(schema);
    const page = root.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
    page.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    let frame;
    const update = () => {
      frame = null;
      const preview = page.querySelector('.pk-product');
      const progress = Math.max(0, Math.min(1, (window.innerHeight - preview.getBoundingClientRect().top) / window.innerHeight));
      page.style.setProperty('--reveal-progress', reduced.matches ? 1 : progress);
      page.style.setProperty('--scroll-progress', window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', scroll, { passive: true }); update();
    return () => { document.title = title; observer.disconnect(); window.removeEventListener('scroll', scroll); cancelAnimationFrame(frame); created.forEach(element => element.remove()); };
  }, []);
  return <main className="pk-page" ref={root}>
    <div className="pk-progress" />
    <header className="pk-nav"><a href="#top" className="pk-brand" aria-label="Pocket home"><img src="/pocket/Branding/Pocket-logo.png" alt="" />pocket<span>®</span></a><nav aria-label="Pocket navigation"><a href="#interface">The plugin</a><a href="#workflow">Listen</a><a href="#compatibility">Compatibility</a></nav><a className="pk-nav-button" href="#buy">Buy Pocket <Arrow /></a></header>
    <section className="pk-hero" id="top"><div className="pk-hero-content"><div className="pk-eyebrow"><i /> A little space changes everything</div><h1>Make room<br />for what<br /><em>matters.</em></h1><p>Pocket is a spectral sidechain VST3 plugin that gives every sound<br className="pk-desktop" /> its own place. Less conflict. More connection.</p><div className="pk-hero-actions"><a className="pk-button" href="#buy">Buy Pocket | $19.99 <Arrow /></a><span>macOS · Windows · VST3 / AU</span></div></div><div className="pk-art"><PocketScene /><div className="pk-art-label"><span>01 | THE POCKET MARK</span><span>SPACE, BY DESIGN</span></div></div><a className="pk-scroll" href="#interface"><span>↓</span> Scroll to find your space</a><div className="pk-hero-note">PRECISION IN THE DETAILS.<br />FEELING IN THE MIX.</div></section>
    <div className="pk-strip"><span>Spectral sidechain</span><i /><span>Frequency-aware ducking</span><i /><span>Your sound, with room to breathe</span><i /><span>Made for the mix</span></div>
    <section className="pk-section pk-interface" id="interface"><div className="pk-section-head" data-reveal><div><div className="pk-eyebrow">01 / A clearer picture</div><h2>Find the space.<br /><em>Keep the feeling.</em></h2></div><p>Pocket listens to your sidechain and gently makes room where frequencies compete. The details are precise. The result stays musical.</p></div><div className="pk-product"><div className="pk-product-top"><span><i /> POCKET | DEVELOPMENT PREVIEW</span><div className="pk-toggle" data-details={details} role="group" aria-label="Interface view"><button aria-pressed={!details} onClick={() => setDetails(false)}>Overview</button><button aria-pressed={details} onClick={() => setDetails(true)}>Details <span>+</span></button></div></div><PocketInterface3D details={details} onDetailsChange={setDetails} /><div className="pk-product-bottom"><span>A focused interface. A deeper level of control.</span><span>Interface subject to change ↗</span></div></div><div className="pk-features">{[['01', 'Space, exactly where it counts.', 'Reduce competing frequencies instead of pulling the whole sound out of the way.'], ['02', 'Dial in the relationship.', 'Shape the amount, range, and response to bring two sounds into balance.'], ['03', 'Hear beneath the surface.', 'Use Delta and Listen to hear what Pocket removes and what the detector follows.']].map(([n, title, text]) => <article data-reveal key={n}><span>{n} /</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <PocketDemos />
    <PocketPurchase />
    <section className="pk-compat pk-section" id="compatibility" data-reveal><div><div className="pk-eyebrow">03 / At home in your setup</div><h2>Your session.<br /><em>Meet Pocket.</em></h2><p>macOS 11 or later and Windows. Unsigned test builds.<br />One launch purchase includes both platforms.</p></div><div className="pk-platforms"><div><span>01</span><h3>macOS</h3><p>VST3 + Audio Unit</p><small>Universal binary · Intel testing pending</small></div><div><span>02</span><h3>Windows</h3><p>VST3</p><small>Unsigned test build</small></div></div></section>
    <section className="pk-waitlist" id="waitlist"><div className="pk-waitlist-inner" data-reveal><div className="pk-eyebrow"><i /> Something good is taking shape</div><h2>Your next mix.<br /><em>A little more Pocket.</em></h2><p>Be the first to know when it’s ready.</p><SignupForm /></div><span className="pk-watermark" aria-hidden="true">pocket</span></section>
    <footer className="pk-footer"><a className="pk-brand" href="#top"><img src="/pocket/Branding/Pocket-logo.png" alt="" />pocket<span>®</span></a><span>Made by Stevenson Nagathota</span><a href="mailto:nagathota.stevenson@gmail.com">Say hello <Arrow /></a><a href="/">Back to studio <Arrow /></a></footer>
  </main>;
}
