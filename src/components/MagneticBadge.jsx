import { useEffect, useRef } from 'react';
import { Spring, useReducedMotion } from '../hooks/useSpring.js';

/**
 * Pointer-proximity attraction with independent X/Y springs
 * (decomposed per axis so differing velocities never desync).
 * Instant press feedback on pointerdown; spring release on leave.
 */
export default function MagneticBadge({ children, className = '', style }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    const sx = new Spring(0, { damping: 0.75, response: 0.4 });
    const sy = new Spring(0, { damping: 0.75, response: 0.4 });
    const radius = 90;
    const strength = 0.28;

    function onMove(e) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        sx.set(dx * strength);
        sy.set(dy * strength);
      } else {
        sx.set(0);
        sy.set(0);
      }
    }
    function onLeave() {
      sx.set(0);
      sy.set(0);
    }
    function onDown() {
      el.style.transition = 'transform .1s ease-out';
      el.style.scale = '0.96';
    }
    function onUp() {
      el.style.transition = '';
      el.style.scale = '1';
    }

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);

    let raf;
    let last = performance.now();
    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      sx.step(dt);
      sy.step(dt);
      el.style.setProperty('--mx', sx.value.toFixed(2) + 'px');
      el.style.setProperty('--my', sy.value.toFixed(2) + 'px');
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  return (
    <div ref={ref} className={`stat-badge ${className}`} style={style}>
      {children}
    </div>
  );
}
