import Reveal from './Reveal.jsx';

export default function Contact() {
  return (
    <section id="contact">
      <div className="container">
        <Reveal className="contact-panel">
          <div className="eyebrow">Let's Work Together</div>
          <h2>Open to opportunities, collaborations &amp; creative challenges.</h2>
          <p className="lede">
            Whether you have a project in mind, want to discuss technology, or just want to say hello, I'd love to hear from you.
          </p>
          <a href="mailto:nagathota.stevenson@gmail.com" className="contact-email">
            nagathota.stevenson@gmail.com
          </a>
          <div className="contact-actions">
            <a href="mailto:nagathota.stevenson@gmail.com" className="btn btn-primary">Send Me Email</a>
            <a
              href="https://www.linkedin.com/in/david-garfield-stevenson-nagathota"
              target="_blank"
              rel="noopener"
              className="btn btn-ghost"
            >
              Connect on LinkedIn
            </a>
          </div>
          <div className="contact-meta">
            <span><span className="dot" />Based in Washington, DC Metropolitan Area</span>
            <span><span className="dot" />Open to remote opportunities and relocation</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
