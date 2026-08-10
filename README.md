# Superboy Steve — Portfolio (React)

Stevenson Nagathota's portfolio, built with Vite + React. Same design as the
static HTML version, componentized: real spring physics (damping/response
model) drives the nav's active-link indicator, magnetic hover on stat/skill
badges, the hero's cursor-reactive glow, and a drag-scrollable Skills rail
with rubber-banding and momentum projection on release.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Project structure

```
src/
  main.jsx              entry point
  App.jsx                assembles all sections
  index.css              design tokens + all styles
  data.js                 skills / experience / projects content
  hooks/
    useSpring.js          Spring class, RAF loop hook, reduced-motion hook,
                            momentum projection + rubber-band helpers
  components/
    Nav.jsx               scrollspy + spring-driven active-link indicator
    Hero.jsx               cursor-reactive ambient glow (spring-follow)
    About.jsx
    Skills.jsx              draggable rail: pointer capture, velocity
                              tracking, rubber-banding, momentum projection
    Experience.jsx          timeline
    Work.jsx                 project grid
    Contact.jsx
    Footer.jsx
    MagneticBadge.jsx        pointer-proximity magnetic hover (used for
                               all stat badges)
    HexBadge.jsx              signature hexagon badge shape
    Reveal.jsx                 scroll-triggered fade/blur-in wrapper
```

## Editing content

Everything in `src/data.js` — skill categories, experience entries, and
project cards — is plain data. Edit those arrays; the layout updates
automatically.

## Motion system

`src/hooks/useSpring.js` exports a small `Spring` class using damping ratio +
response (seconds) instead of fixed-duration easing, so any spring can be
redirected mid-flight from wherever it currently is — the interruptibility
model described in Apple's fluid-interface design talks. It's used directly
(not through a JS animation library) so behavior stays fully inspectable and
dependency-free.

All motion respects `prefers-reduced-motion: reduce` — ambient blobs and
magnetic pull are skipped entirely, and scroll reveals fall back to a plain
opacity fade.
