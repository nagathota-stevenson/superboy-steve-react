import opentype from 'opentype.js';
import libtess from 'libtess';
import { ShapePath } from 'three';
import { readFileSync, writeFileSync } from 'node:fs';
const bytes=readFileSync('public/pocket/InterVariable.ttf');
const font=opentype.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
const glyphs={};
for(let code=32;code<=126;code++){
  const char=String.fromCharCode(code),glyph=font.charToGlyph(char),path=new ShapePath();
  for(const c of glyph.getPath(0,0,1000).commands){
    if(c.type==='M')path.moveTo(c.x,-c.y);else if(c.type==='L')path.lineTo(c.x,-c.y);
    else if(c.type==='Q')path.quadraticCurveTo(c.x1,-c.y1,c.x,-c.y);
    else if(c.type==='C')path.bezierCurveTo(c.x1,-c.y1,c.x2,-c.y2,c.x,-c.y);
    else if(c.type==='Z')path.currentPath.closePath();
  }
  const vertices=[],tess=new libtess.GluTesselator();
  tess.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA,(vertex,output)=>output.push(Math.round(vertex[0]*100)/100,Math.round(vertex[1]*100)/100));
  tess.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE,coords=>[coords[0],coords[1],coords[2]]);
  tess.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG,()=>{});
  tess.gluTessCallback(libtess.gluEnum.GLU_TESS_ERROR,error=>{throw new Error(`Glyph ${char}: ${error}`);});
  tess.gluTessNormal(0,0,1);
  tess.gluTessProperty(libtess.gluEnum.GLU_TESS_WINDING_RULE,libtess.windingRule.GLU_TESS_WINDING_NONZERO);
  tess.gluTessBeginPolygon(vertices);
  for(const contour of path.subPaths){tess.gluTessBeginContour();for(const p of contour.getPoints(16)){const vertex=[p.x,p.y,0];tess.gluTessVertex(vertex,vertex);}tess.gluTessEndContour();}
  tess.gluTessEndPolygon();
  glyphs[char]={advance:glyph.advanceWidth/font.unitsPerEm*1000,vertices};
}
writeFileSync('src/components/pocketVectorFont.json',JSON.stringify({family:'Inter',units:1000,glyphs})+'\n');
console.log('Generated 95 Inter glyph meshes using nonzero winding, including overlapping contours.');
