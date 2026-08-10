import { useEffect, useRef } from 'react';

export default function Reveal({ children, className = '', style, stagger = false, as: Tag = 'div' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${stagger ? 'reveal-stagger' : ''} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
