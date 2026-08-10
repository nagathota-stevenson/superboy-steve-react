import { useEffect, useRef } from 'react';
import { Spring, useReducedMotion } from '../hooks/useSpring.js';
import MagneticBadge from './MagneticBadge.jsx';

export default function Hero() {
  const heroRef = useRef(null);
  const blobVioletRef = useRef(null);
  const blobGoldRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const heroEl = heroRef.current;
    const blobViolet = blobVioletRef.current;
    const blobGold = blobGoldRef.current;
    if (!heroEl || !blobViolet || !blobGold) return;

    const vSpring = { x: new Spring(0, { damping: 1, response: 1.1 }), y: new Spring(0, { damping: 1, response: 1.1 }) };
    const gSpring = { x: new Spring(0, { damping: 1, response: 1.6 }), y: new Spring(0, { damping: 1, response: 1.6 }) };

    function onMove(e) {
      const r = heroEl.getBoundingClientRect();
      const targetX = ((e.clientX - r.left) / r.width - 0.5) * 70;
      const targetY = ((e.clientY - r.top) / r.height - 0.5) * 70;
      vSpring.x.set(targetX); vSpring.y.set(targetY);
      gSpring.x.set(-targetX * 0.6); gSpring.y.set(-targetY * 0.6);
    }
    heroEl.addEventListener('pointermove', onMove);

    let raf;
    let last = performance.now();
    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      vSpring.x.step(dt); vSpring.y.step(dt);
      gSpring.x.step(dt); gSpring.y.step(dt);
      blobViolet.style.transform = `translate(${vSpring.x.value}px, ${vSpring.y.value}px)`;
      blobGold.style.transform = `translate(${gSpring.x.value}px, ${gSpring.y.value}px)`;
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      heroEl.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  return (
    <section className="hero" id="home" ref={heroRef}>
      <div className="hero-blobs">
        <div className="blob blob-violet" ref={blobVioletRef} />
        <div className="blob blob-gold" ref={blobGoldRef} />
      </div>
      <div className="container hero-grid">
        <div>
          <div className="hero-kicker"><span className="pulse" />OPEN TO NEW OPPORTUNITIES</div>
          <h1>Stevenson<span className="line2">Nagathota</span></h1>
          <div className="hero-role">// Full Stack Developer &amp; Enterprise Architect</div>
          <p className="hero-desc">
            Building scalable enterprise applications, powerful APIs, interactive dashboards, and elegant digital experiences with modern technologies and creative vision.
          </p>
          <div className="hero-actions">
            <a href="#work" className="btn btn-primary">View My Work</a>
            <a href="#contact" className="btn btn-ghost">Get In Touch</a>
          </div>
        </div>
        <div className="badge-cluster">
          <MagneticBadge><span className="num">4+</span><span className="lbl">Years Experience</span></MagneticBadge>
          <MagneticBadge><span className="num">20+</span><span className="lbl">Projects Delivered</span></MagneticBadge>
          <MagneticBadge><span className="num">30+</span><span className="lbl">Technologies</span></MagneticBadge>
          <MagneticBadge><span className="num">100+</span><span className="lbl">Team Collaborations</span></MagneticBadge>
        </div>
      </div>
    </section>
  );
}
