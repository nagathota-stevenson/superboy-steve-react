import { useEffect, useRef, useState } from 'react';
import { Spring, useRafLoop } from '../hooks/useSpring.js';

export default function Nav({ isMusicPage = false }) {
  const LINKS = isMusicPage
    ? [
        { id: 'home', label: 'Home', href: '/' },
        { id: 'music', label: 'Music', href: '/music' },
      ]
    : [
        { id: 'home', label: 'Home', href: '#home' },
        { id: 'about', label: 'About', href: '#about' },
        { id: 'skills', label: 'Skills', href: '#skills' },
        { id: 'experience', label: 'Experience', href: '#experience' },
        { id: 'work', label: 'Work', href: '#work' },
        { id: 'music', label: 'Music', href: '/music' },
        { id: 'contact', label: 'Contact', href: '#contact' },
      ];

  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(isMusicPage ? 'music' : 'home');
  const [sheetOpen, setSheetOpen] = useState(false);

  const linksWrapRef = useRef(null);
  const linkRefs = useRef({});
  const indicatorRef = useRef(null);
  const sx = useRef(new Spring(0, { damping: 1, response: 0.35 })).current;
  const sw = useRef(new Spring(0, { damping: 1, response: 0.35 })).current;
  const initedRef = useRef(false);

  function setIndicatorTarget(id, instant = false) {
    const wrap = linksWrapRef.current;
    const el = linkRefs.current[id];
    if (!wrap || !el) return;
    const wrapRect = wrap.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const x = rect.left - wrapRect.left;
    const w = rect.width;
    if (instant) {
      sx.value = x; sx.target = x;
      sw.value = w; sw.target = w;
    } else {
      sx.set(x);
      sw.set(w);
    }
  }

  useEffect(() => {
    setIndicatorTarget(isMusicPage ? 'music' : 'home', true);
    initedRef.current = true;
  }, [isMusicPage]);

  useEffect(() => {
    if (isMusicPage) {
      setScrolled(window.scrollY > 40);
      return;
    }

    function onScroll() {
      setScrolled(window.scrollY > 40);
      const scrollPos = window.scrollY + 120;
      let currentId = 'home';
      LINKS.forEach(({ id }) => {
        const sec = document.getElementById(id);
        if (sec && sec.offsetTop <= scrollPos) currentId = id;
      });
      setActive((prev) => {
        if (prev !== currentId) return currentId;
        return prev;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMusicPage]);

  useEffect(() => {
    if (initedRef.current) setIndicatorTarget(active);
  }, [active]);

  useRafLoop((dt) => {
    sx.step(dt);
    sw.step(dt);
    if (indicatorRef.current) {
      indicatorRef.current.style.transform = `translateX(${sx.value}px)`;
      indicatorRef.current.style.width = `${sw.value}px`;
    }
    return true;
  });

  return (
    <>
      <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href={isMusicPage ? '/' : '#home'} className="nav-brand">
          <span className="dot" />SUPERBOY&nbsp;STEVE
        </a>
        <nav className="nav-links" ref={linksWrapRef}>
          <div id="nav-indicator" ref={indicatorRef} />
          {LINKS.map(({ id, label, href }) => (
            <a
              key={id}
              href={href}
              ref={(el) => (linkRefs.current[id] = el)}
              className={`nav-link ${active === id ? 'active' : ''}`}
              onMouseEnter={() => setIndicatorTarget(id)}
              onMouseLeave={() => setIndicatorTarget(active)}
            >
              {label}
            </a>
          ))}
        </nav>
        <a href={isMusicPage ? '/#contact' : '#contact'} className="nav-cta">Get In Touch</a>
        <button className="nav-toggle" aria-label="Open menu" onClick={() => setSheetOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" /></svg>
        </button>
      </header>

      <div className={`mobile-sheet ${sheetOpen ? 'open' : ''}`}>
        {LINKS.map(({ id, label, href }) => (
          <a key={id} href={href} onClick={() => setSheetOpen(false)}>{label}</a>
        ))}
      </div>
    </>
  );
}
