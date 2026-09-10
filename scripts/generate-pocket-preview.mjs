import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const bytes=readFileSync(resolve(root,'public/pocket/InterVariable.ttf'));
const font=opentype.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
const text=(value,x,y,size,fill)=>{
 let cursor=x;const paths=[];
 for(const character of value){const glyph=font.charToGlyph(character);paths.push(glyph.getPath(cursor,y,size).toPathData(2));cursor+=glyph.advanceWidth/font.unitsPerEm*size;}
 return `<path d="${paths.join(' ')}" fill="${fill}"/>`;
};
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
 <linearGradient id="bg" x2="1" y2="1"><stop stop-color="#0e0e11"/><stop offset="1" stop-color="#251c31"/></linearGradient>
 <radialGradient id="halo"><stop stop-color="#9572c7" stop-opacity=".22"/><stop offset="1" stop-color="#9572c7" stop-opacity="0"/></radialGradient>
 <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eee4ff"/><stop offset=".42" stop-color="#bba0e3"/><stop offset=".7" stop-color="#f2eaff"/><stop offset="1" stop-color="#806293"/></linearGradient>
 <g id="mark"><circle r="178"/><path d="M-177 -14H-92C-40-14-52 82 0 82S40-14 92-14h85"/></g>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<ellipse cx="902" cy="297" rx="300" ry="280" fill="url(#halo)"/>
${text('pocket',70,88,36,'#f4effa')}
${text('Make room',66,207,76,'#f4effa')}
${text('for what',66,287,76,'#f4effa')}
${text('matters.',66,367,76,'#bea5ef')}
${text('A spectral sidechain for a clearer mix.',70,437,21,'#c0b5cb')}
${text('Listen. Compare. Find your space.',70,470,17,'#998ca8')}
<g fill="none" stroke-width="10" stroke-linejoin="round" stroke-linecap="round">
 <use href="#mark" transform="translate(911 306)" stroke="#35283f"/>
 <use href="#mark" transform="translate(907 300)" stroke="#735a8d"/>
 <use href="#mark" transform="translate(902 293)" stroke="url(#metal)"/>
</g>
<path d="M70 525H1130" stroke="#ffffff24"/>
${text('superboysteve.com/pocket',70,575,18,'#b4a2c9')}
${text('COMING SOON',932,575,16,'#c4b4d9')}
</svg>`;
const png=await sharp(Buffer.from(svg)).png({compressionLevel:9}).toBuffer();
const hash=createHash('sha256').update(png).digest('hex').slice(0,12);
const dir=resolve(root,'public/pocket/social');mkdirSync(dir,{recursive:true});
const filename=`pocket-preview-${hash}.png`;
for(const old of readdirSync(dir))if(/^pocket-preview-[a-f0-9]{12}\.png$/.test(old)&&old!==filename)unlinkSync(resolve(dir,old));
writeFileSync(resolve(dir,filename),png);
const image=`https://superboysteve.com/pocket/social/${filename}`;
const title='Pocket | Make room for what matters';
const description='A spectral sidechain plugin that gives every sound its own space. Explore Pocket, hear before-and-after audio demos, and join the launch waitlist.';
const alt='Pocket spectral sidechain plugin. Make room for what matters, alongside the circular Pocket logo in violet metal.';
let html=readFileSync(resolve(root,'index.html'),'utf8');
html=html.replace(/\s*<meta\s+(?:name="(?:description|twitter:[^"]+)"|property="og:[^"]+")[^>]*\/>/g,'');
html=html.replace(/<title>[^<]*<\/title>/,`<title>${title}</title>`).replace('content="#0A0A0C"','content="#0e0e11"');
const metadata=`
  <meta name="description" content="${description}" />
  <link rel="canonical" href="https://superboysteve.com/pocket" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Pocket" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:url" content="https://superboysteve.com/pocket" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:secure_url" content="${image}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${alt}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta name="twitter:image:alt" content="${alt}" />
`;
html=html.replace('</head>',`${metadata}</head>`);
writeFileSync(resolve(root,'pocket.html'),html);
console.log(`Generated Pocket HTML metadata and ${filename} (${png.length} bytes).`);
