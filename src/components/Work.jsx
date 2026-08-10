import Reveal from './Reveal.jsx';
import HexBadge from './HexBadge.jsx';
import { projects } from '../data.js';

export default function Work() {
  return (
    <section id="work">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">Featured Projects</div>
            <h2 className="section-title">A selection of what<br />I've shipped.</h2>
          </div>
        </Reveal>
        <div className="project-grid">
          {projects.map((p, i) => (
            <Reveal
              key={p.name}
              className={`project-card ${p.featured ? 'featured' : ''}`}
              stagger
              style={{ '--i': i }}
            >
              <div className="project-top">
                <div className="project-mark">
                  <HexBadge>{p.mark}</HexBadge>
                </div>
                <div className="project-star"><span className="gstar">★</span>{p.highlight}</div>
              </div>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <div className="project-tags">
                {p.tags.map((t) => <span className="chip" key={t}>{t}</span>)}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
