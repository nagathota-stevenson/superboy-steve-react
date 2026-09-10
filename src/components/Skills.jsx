import { useEffect, useRef } from 'react';
import Reveal from './Reveal.jsx';
import HexBadge from './HexBadge.jsx';
import { skillGroups } from '../data.js';
import { Spring, project, rubberband } from '../hooks/useSpring.js';

export default function Skills() {
  const railRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const rail = railRef.current;
    const track = trackRef.current;
    if (!rail || !track) return;

    const posSpring = new Spring(0, { damping: 1, response: 0.45 });
    let dragging = false;
    let startX = 0;
    let startPos = 0;
    let history = [];
    let minPos = 0;
    let maxPos = 0;
    let raf;

    function computeBounds() {
      const railW = rail.clientWidth;
      const trackW = track.scrollWidth;
      minPos = Math.min(0, railW - trackW - 24);
      maxPos = 0;
    }
    computeBounds();
    const onResize = () => computeBounds();
    window.addEventListener('resize', onResize);

    function applyPos(p) {
      track.style.transform = `translate3d(${p}px,0,0)`;
    }

    function onPointerDown(e) {
      dragging = true;
      rail.classList.add('grabbing');
      rail.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startPos = posSpring.value;
      history = [{ x: e.clientX, t: performance.now() }];
      posSpring.velocity = 0;
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      let p = startPos + dx;

      if (p > maxPos) p = maxPos + rubberband(p - maxPos, rail.clientWidth);
      if (p < minPos) p = minPos - rubberband(minPos - p, rail.clientWidth);

      posSpring.value = p;
      posSpring.target = p;
      applyPos(p);

      const now = performance.now();
      history.push({ x: e.clientX, t: now });
      if (history.length > 6) history.shift();
    }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove('grabbing');

      let vel = 0;
      if (history.length >= 2) {
        const a = history[0];
        const b = history[history.length - 1];
        const dt = b.t - a.t || 16;
        vel = ((b.x - a.x) / dt) * 1000;
      }

      let target = posSpring.value + project(vel);
      target = Math.max(minPos, Math.min(maxPos, target));
      posSpring.set(target, vel);
    }

    function onWheel(e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      let target = posSpring.target - e.deltaY;
      target = Math.max(minPos, Math.min(maxPos, target));
      posSpring.set(target);
    }

    rail.addEventListener('pointerdown', onPointerDown);
    rail.addEventListener('pointermove', onPointerMove);
    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);
    rail.addEventListener('wheel', onWheel, { passive: false });

    let last = performance.now();
    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      if (!dragging) {
        posSpring.step(dt);
        applyPos(posSpring.value);
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', onResize);
      rail.removeEventListener('pointerdown', onPointerDown);
      rail.removeEventListener('pointermove', onPointerMove);
      rail.removeEventListener('pointerup', endDrag);
      rail.removeEventListener('pointercancel', endDrag);
      rail.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="skills">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">Technical Skills</div>
            <h2 className="section-title">Expertise across the<br />modern stack.</h2>
            <p className="section-lede">
              Focused on scalability and performance, from frontend architecture through to cloud infrastructure.
            </p>
          </div>
        </Reveal>
      </div>
      <Reveal className="rail-wrap">
        <div className="rail" ref={railRef}>
          <div className="rail-track" ref={trackRef}>
            {skillGroups.map((g, i) => (
              <div className="skill-card" key={g.name}>
                <div className="skill-card-head">
                  <HexBadge size="sm">
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--violet-soft)', fontSize: '.8rem' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </HexBadge>
                  <h3>{g.name}</h3>
                </div>
                <div className="skill-tags">
                  {g.items.map((it) => <span className="chip" key={it}>{it}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container">
          <div className="rail-hint">← drag to explore →</div>
        </div>
      </Reveal>
    </section>
  );
}
