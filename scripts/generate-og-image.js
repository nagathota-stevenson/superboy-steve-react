import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputDir = resolve(__dirname, '../public');
mkdirSync(outputDir, { recursive: true });

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">Stevenson Nagathota | Full Stack Developer</title>
  <desc id="desc">Dark developer brand image with name, title, and modern gradient accent shapes.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0A0C" />
      <stop offset="100%" stop-color="#161117" />
    </linearGradient>
    <linearGradient id="highlight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7F5FFF" />
      <stop offset="100%" stop-color="#F7B05B" />
    </linearGradient>
    <style><![CDATA[
      .bg { fill: url(#bg); }
      .accent { fill: url(#highlight); opacity: 0.48; }
      .title { font-family: 'Inter', system-ui, sans-serif; font-size: 64px; font-weight: 800; fill: #FFFFFF; letter-spacing: -0.04em; }
      .subtitle { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 24px; fill: #BFB6F0; letter-spacing: 0.18em; text-transform: uppercase; }
      .description { font-family: 'Inter', system-ui, sans-serif; font-size: 28px; fill: #D7D2FF; line-height: 1.4; }
    ]]></style>
  </defs>
  <rect width="1200" height="630" class="bg" />
  <circle cx="980" cy="210" r="135" class="accent" />
  <circle cx="880" cy="450" r="190" class="accent" />
  <rect x="72" y="78" width="1056" height="420" rx="34" ry="34" fill="rgba(255,255,255,0.02)" />
  <text x="96" y="184" class="subtitle">// Full Stack Developer & Enterprise Architect</text>
  <text x="96" y="280" class="title">Stevenson Nagathota</text>
  <text x="96" y="360" class="description">Building modern web apps, APIs, dashboards, and elegant digital experiences.</text>
</svg>`;

const outputPath = resolve(outputDir, 'og-image.svg');
writeFileSync(outputPath, svg, 'utf8');
console.log(`Generated ${outputPath}`);
