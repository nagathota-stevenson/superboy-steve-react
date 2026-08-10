import Reveal from './Reveal.jsx';
import MagneticBadge from './MagneticBadge.jsx';

export default function About() {
  return (
    <section id="about">
      <div className="container">
        <Reveal className="section-head">
          <div>
            <div className="eyebrow">About Me</div>
            <h2 className="section-title">Full stack development,<br />enterprise-grade thinking.</h2>
          </div>
        </Reveal>
        <div className="about-grid">
          <Reveal className="about-copy">
            <p>
              I'm a <strong>Full Stack Developer</strong> passionate about building elegant, scalable solutions.
              With <strong>4+ years</strong> of hands-on experience across frontend architecture, backend
              engineering, API development, and cloud deployment, I specialize in transforming complex business
              requirements into production-ready applications.
            </p>
            <p>
              Currently developing enterprise applications at the <strong>World Bank</strong>, I excel at crafting
              performant dashboards, robust APIs, and seamless user experiences using modern technologies.
            </p>
            <ul className="do-list">
              <li><span className="arrow">→</span>Build scalable React applications with intuitive UX</li>
              <li><span className="arrow">→</span>Architect backend services using .NET and Node.js</li>
              <li><span className="arrow">→</span>Optimize databases and design robust data models</li>
              <li><span className="arrow">→</span>Implement CI/CD workflows and cloud automation</li>
              <li><span className="arrow">→</span>Integrate AI/ML capabilities into applications</li>
            </ul>
          </Reveal>
          <Reveal className="stat-grid-2">
            <MagneticBadge><span className="num">4+</span><span className="lbl">Years Experience</span></MagneticBadge>
            <MagneticBadge><span className="num">20+</span><span className="lbl">Projects Delivered</span></MagneticBadge>
            <MagneticBadge><span className="num">30+</span><span className="lbl">Technologies</span></MagneticBadge>
            <MagneticBadge><span className="num">100+</span><span className="lbl">Team Collaborations</span></MagneticBadge>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
