import { useEffect, useRef, useState } from 'react';

/**
 * Damped-spring stepper driven by damping ratio + response (seconds),
 * following Apple's fluid-interface model rather than fixed-duration
 * easing. Reading `value` live on every retarget (via `.set`) keeps
 * animations interruptible: a new target blends from wherever the
 * spring currently is, never snapping to it.
 */
export class Spring {
  constructor(value = 0, { damping = 1, response = 0.35, mass = 1 } = {}) {
    this.value = value;
    this.velocity = 0;
    this.target = value;
    this.damping = damping;
    this.response = response;
    this.mass = mass;
  }
  set(target, velocity) {
    this.target = target;
    if (velocity !== undefined) this.velocity = velocity;
  }
  step(dt) {
    const angFreq = (2 * Math.PI) / this.response;
    const stiffness = this.mass * angFreq * angFreq;
    const dampCoef = 2 * this.mass * this.damping * angFreq;
    const force = -stiffness * (this.value - this.target) - dampCoef * this.velocity;
    const accel = force / this.mass;
    this.velocity += accel * dt;
    this.value += this.velocity * dt;
    return this.value;
  }
}

/** Runs `stepFn(dt)` every frame via requestAnimationFrame until unmount. */
export function useRafLoop(stepFn, active = true) {
  const stepRef = useRef(stepFn);
  stepRef.current = stepFn;

  useEffect(() => {
    if (!active) return;
    let raf;
    let last = performance.now();
    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      const cont = stepRef.current(dt);
      if (cont !== false) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** Apple's exponential-decay momentum projection: where a flick lands. */
export function project(velocity, decel = 0.996) {
  return (velocity / 1000) * decel / (1 - decel);
}

/** Progressive edge resistance instead of a hard stop. */
export function rubberband(overshoot, dimension, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}
