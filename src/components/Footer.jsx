export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">David Stevenson</div>
            <p className="footer-desc">
              Full Stack Developer building enterprise applications, APIs, dashboards, and creative digital experiences.
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <a href="#about">About</a>
            <a href="#work">Projects</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-col">
            <h4>Get In Touch</h4>
            <a href="mailto:nagathota.stevenson@gmail.com">nagathota.stevenson@gmail.com</a>
            <span>Washington, DC Metropolitan Area</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 David Stevenson. All rights reserved.</span>
          <div className="footer-socials">
            <a href="https://github.com/nagathota-stevenson" target="_blank" rel="noopener">GitHub ↗</a>
            <a href="https://www.linkedin.com/in/david-garfield-stevenson-nagathota" target="_blank" rel="noopener">LinkedIn ↗</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
