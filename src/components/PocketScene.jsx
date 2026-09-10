import { useEffect, useRef, useState } from 'react';
import { createPocketLogoGeometry } from './pocketLogoGeometry.js';

export default function PocketScene() {
  const host = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let disposed = false;
    let cleanup;
    Promise.all([import('three'), import('three/addons/environments/RoomEnvironment.js')]).then(([THREE, { RoomEnvironment }]) => {
      if (disposed) return;
      const el = host.current;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
      camera.position.set(0, 0, 10);

      // A studio environment gives the bevels real reflections, even at rest.
      const pmrem = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = pmrem.fromScene(room, .04);
      scene.environment = environment.texture;
      room.dispose();
      pmrem.dispose();
      const face = new THREE.MeshPhysicalMaterial({ color: 0xd0c0f5, metalness: .78, roughness: .24, clearcoat: 1, clearcoatRoughness: .18, envMapIntensity: 1.2 });
      const edge = new THREE.MeshPhysicalMaterial({ color: 0x9371c8, metalness: .85, roughness: .2, clearcoat: 1, envMapIntensity: 1.35 });
      const geometry = createPocketLogoGeometry(THREE);
      const emblem = new THREE.Mesh(geometry, [face, edge]);
      emblem.rotation.set(.12, -.3, -.055);
      scene.add(emblem);
      scene.add(new THREE.HemisphereLight(0xe4ddff, 0x271638, 2));
      const key = new THREE.DirectionalLight(0xf4ebff, 4);
      key.position.set(-3, 4, 5); scene.add(key);
      const rim = new THREE.DirectionalLight(0xab8cff, 3);
      rim.position.set(4, 1, -2); scene.add(rim);
      const fill = new THREE.DirectionalLight(0xb9d6ff, 1.5);
      fill.position.set(2, -3, 4); scene.add(fill);
      el.appendChild(renderer.domElement);

      let frame = 0, visible = true, pointerX = 0, pointerY = 0, previousTime = 0;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      const render = (time) => {
        if (disposed) return;
        const delta = Math.min((time - previousTime) / 1000, .05);
        previousTime = time;
        if (reduced.matches) {
          emblem.rotation.set(.12, -.3, -.055);
          emblem.position.y = 0;
        } else {
          const scroll = Math.min(window.scrollY / 900, 1);
          const ease = 1 - Math.exp(-5 * delta);
          // Small rotations keep the logo readable; never rotate it edge-on.
          emblem.rotation.y += (-.3 + pointerX + scroll * .32 + Math.sin(time * .0003) * .035 - emblem.rotation.y) * ease;
          emblem.rotation.x += (.12 + pointerY - emblem.rotation.x) * ease;
          emblem.position.y = Math.sin(time * .00065) * .065;
        }
        renderer.render(scene, camera);
      };
      const animate = (time) => {
        frame = 0;
        if (!visible || document.hidden) return;
        render(time);
        if (!reduced.matches) frame = requestAnimationFrame(animate);
      };
      const start = () => { if (!frame) animate(performance.now()); };
      const resize = new ResizeObserver(() => {
        const { width, height } = el.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        // Fit the full emblem on tall/narrow screens, with room for its bevel.
        camera.position.z = Math.max(9.3, 2.5 / (Math.tan(THREE.MathUtils.degToRad(17.5)) * camera.aspect));
        camera.updateProjectionMatrix();
        render(performance.now());
        setReady(true);
      });
      const move = (event) => {
        if (event.pointerType === 'touch') return;
        const rect = el.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width - .5) * .3;
        pointerY = ((event.clientY - rect.top) / rect.height - .5) * .18;
      };
      const resetPointer = () => { pointerX = 0; pointerY = 0; };
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); }, { threshold: 0 });
      const motion = () => { cancelAnimationFrame(frame); frame = 0; start(); };
      const contextLost = (event) => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; setReady(false); };
      const contextRestored = () => { setReady(true); start(); };
      resize.observe(el); observer.observe(el);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', resetPointer);
      renderer.domElement.addEventListener('webglcontextlost', contextLost);
      renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
      document.addEventListener('visibilitychange', start);
      reduced.addEventListener('change', motion);
      start();
      cleanup = () => {
        cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', resetPointer);
        document.removeEventListener('visibilitychange', start); reduced.removeEventListener('change', motion);
        renderer.domElement.removeEventListener('webglcontextlost', contextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
        geometry.dispose(); face.dispose(); edge.dispose(); environment.dispose();
        renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { /* Keep the recognizable vector logo if WebGL is unavailable. */ });
    return () => { disposed = true; cleanup?.(); };
  }, []);
  return <div ref={host} className={`pk-scene pk-logo-scene${ready ? ' is-ready' : ''}`} role="img" aria-label="Pocket’s circular logo with its curved center dip, sculpted in beveled violet metal">
    {!ready && <div className="pk-logo-fallback" aria-hidden="true"><svg viewBox="-2.1 -2.1 4.2 4.2" fill="none"><g transform="scale(1 -1)" stroke="currentColor" strokeWidth=".11"><circle r="1.95" /><path d="M-1.93 .1H-1C-.43 .1-.57-.9 0-.9S.43 .1 1 .1h.93" /></g></svg></div>}
  </div>;
}
