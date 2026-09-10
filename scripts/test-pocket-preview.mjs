import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
const html=readFileSync('dist/pocket.html','utf8');
const home=readFileSync('dist/index.html','utf8');
const config=JSON.parse(readFileSync('firebase.json','utf8'));
function meta(key){const matches=[...html.matchAll(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`, 'g'))];assert.equal(matches.length,1,`${key} must appear exactly once`);return matches[0][1];}
assert.match(html,/<title>Pocket \| Make room for what matters<\/title>/);
assert.equal(meta('og:title'),meta('twitter:title'));
assert.equal(meta('og:description'),meta('description'));
assert.equal(meta('og:description'),meta('twitter:description'));
assert.equal(meta('og:url'),'https://superboysteve.com/pocket');
assert.equal(meta('og:image'),meta('twitter:image'));
assert.equal(meta('og:image'),meta('og:image:secure_url'));
assert.equal(meta('og:image:type'),'image/png');
assert.equal(meta('twitter:card'),'summary_large_image');
assert.ok(meta('og:image:alt').includes('Pocket'));
const image=new URL(meta('og:image'));
assert.equal(image.origin,'https://superboysteve.com');
const imageBytes=readFileSync(`dist${image.pathname}`);
const dimensions=await sharp(imageBytes).metadata();
assert.equal(dimensions.width,1200);assert.equal(dimensions.height,630);assert.equal(dimensions.format,'png');
assert.match(html,/<link rel="canonical" href="https:\/\/superboysteve.com\/pocket"/);
for(const path of ['/pocket','/pocket/']){
 const route=config.hosting.rewrites.find(r=>r.source===path||r.source==='**');assert.equal(route.destination,'/pocket.html');
}
assert.match(home,/<title>Superboy Steve/,'Homepage metadata stays intact');
assert.equal(html.match(/<script[^>]*src="([^"]+)"/)[1],home.match(/<script[^>]*src="([^"]+)"/)[1]);
console.log('PASS: static Pocket metadata, unique OG/Twitter tags, canonical URL, PNG dimensions, route precedence, and shared app entry');
