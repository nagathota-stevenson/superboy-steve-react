import Reveal from './Reveal.jsx';
import HexBadge from './HexBadge.jsx';
import { experience } from '../data.js';

export default function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">Professional Experience</div>
            <h2 className="section-title">Full stack development,<br />across industries.</h2>
          </div>
        </Reveal>
        <div className="timeline">
          {experience.map((e, i) => (
            <Reveal key={e.role + e.company} className="tl-item" stagger style={{ '--i': i }}>
              <div className="tl-node">
                <HexBadge>{String(i + 1).padStart(2, '0')}</HexBadge>
              </div>
              <div className="tl-head">
                <span className="tl-role">{e.role}</span>
                <span className="tl-date">{e.date}</span>
              </div>
              <div className="tl-company">{e.company}</div>
              <p className="tl-desc">{e.desc}</p>
              <div className="tl-tags">
                {e.tags.map((t) => <span className="chip" key={t}>{t}</span>)}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
