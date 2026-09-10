import font from './pocketVectorFont.json';
import traces from './pocketInterfaceTraces.json';

import { defaultInterfaceValues, interfaceControls } from './pocketInterfaceControls.js';
export { defaultInterfaceValues, interfaceControls };

export function buildPocketInterface(THREE, details, values, onChange) {
  const root=new THREE.Group(), height=details?900:720;
  const materials=[], targets=[], updaters={};
  const basic=color=>{const material=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide});materials.push(material);return material;};
  const lit=color=>{const material=new THREE.MeshStandardMaterial({color,metalness:.18,roughness:.33});materials.push(material);return material;};
  const ink=basic('#32303e'),muted=basic('#625d72'),purple=basic('#8068bd'),grid=basic('#dcd8e4'),white=basic('#f8f7fa');
  const faceMaterial=basic('#eeedf2'),edgeMaterial=lit('#d0cbdc'),dialMaterial=lit('#f1eff6');
  const px=x=>(x-640)/100, py=y=>(height/2-y)/100;
  function add(mesh,x,y,z=.075){mesh.position.set(px(x),py(y),z);root.add(mesh);return mesh;}
  function label(text,x,y,size=10,material=muted,align='left',z=.085) {
    const vertices=[];let cursor=0;const factor=size/100000;
    for(const char of text){
      const glyph=font.glyphs[char]||font.glyphs['?'];
      for(let i=0;i<glyph.vertices.length;i+=2)vertices.push((glyph.vertices[i]+cursor)*factor,glyph.vertices[i+1]*factor,0);
      cursor+=glyph.advance;
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    const mesh=add(new THREE.Mesh(geometry,material),x,y,z);
    if(align==='center')mesh.position.x-=cursor*factor/2;else if(align==='right')mesh.position.x-=cursor*factor;
    return mesh;
  }
  function stroke(points,material,width=1,z=.08){
    const vertices=[];
    for(let i=1;i<points.length;i++){
      const [ax,ay]=points[i-1],[bx,by]=points[i],dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy);if(!length)continue;
      const nx=-dy/length*width/2,ny=dx/length*width/2;
      const p=[[ax+nx,ay+ny],[ax-nx,ay-ny],[bx+nx,by+ny],[bx-nx,by-ny]];
      for(const index of [0,1,2,2,1,3])vertices.push(px(p[index][0]),py(p[index][1]),z);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    const mesh=new THREE.Mesh(geometry,material);root.add(mesh);return mesh;
  }
  function roundedShape(w,h,r){
    const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;
  }
  function plate(x,y,w,h,depth,material,r=4,z=.06){
    const g=new THREE.ExtrudeGeometry(roundedShape(w/100,h/100,r/100),{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:Math.min(.015,h/600),bevelThickness:Math.min(.015,depth/3),curveSegments:12});
    return add(new THREE.Mesh(g,[material,edgeMaterial]),x,y,z);
  }
  function cylinder(x,y,r,depth,material,z){
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r/100,r/100,depth,96),material);mesh.rotation.x=Math.PI/2;return add(mesh,x,y,z);
  }
  const chassis=plate(640,height/2,1276,height-4,.22,faceMaterial,10,-.22);chassis.userData.chassis=true;
  // Every trace and every glyph below is geometry, with no image or canvas map.
  label('pocket',38,58,28,ink);
  [['Input',392,'#aaa1bd'],['Sidechain',453,'#b18a80'],['Reduction',541,'#7d66b8']].forEach(([name,x,color])=>{const material=basic(color);cylinder(x,122,2,.006,material,.081);label(name,x+8,125,8,material);});
  label('3.93 dB',1237,125,8,muted,'right');
  [145,333,520].forEach(y=>stroke([[390,y],[1237,y]],grid,.65));
  [587,869,1152].forEach(x=>stroke([[x,145],[x,520]],grid,.65));
  const trace=traces[details?'details':'overview'];
  stroke(trace.input,basic('#c1bace'),.8,.086);stroke(trace.sidechain,basic('#bea69f'),.8,.087);
  const reduction=stroke(trace.reduction,purple,1.8,.088);
  [[587,'100'],[869,'1k'],[1152,'10k']].forEach(([x,name])=>label(name,x,540,8,muted,'center'));
  function arc(start,end,r){return Array.from({length:160},(_,i)=>{const a=start+(end-start)*i/159;return[198+Math.cos(a)*r,345+Math.sin(a)*r];});}
  const amountStart=Math.PI*.72,amountSweep=Math.PI*1.56;
  stroke(arc(amountStart,amountStart+amountSweep,117),grid,2,.085);
  const amountArc=stroke(arc(amountStart,amountStart+amountSweep,117),purple,2.5,.09);
  amountArc.name='amount-fill';
  // Real stepped knob: recessed collar, machined side wall and beveled top.
  cylinder(198,345,107,.045,edgeMaterial,.085);
  const knob=new THREE.Group();knob.position.set(px(198),py(345),.11);root.add(knob);
  const profile=[new THREE.Vector2(0,0),new THREE.Vector2(1.015,0),new THREE.Vector2(1.052,.025),new THREE.Vector2(1.052,.18),new THREE.Vector2(1.025,.215),new THREE.Vector2(0,.215)];
  const knobBody=new THREE.Mesh(new THREE.LatheGeometry(profile,128),dialMaterial);knobBody.rotation.x=Math.PI/2;knob.add(knobBody);
  const cap=new THREE.Mesh(new THREE.CircleGeometry(1.025,128),white);cap.position.z=.216;knob.add(cap);
  const notchPath=new THREE.CurvePath();
  notchPath.add(new THREE.LineCurve(new THREE.Vector2(127,345),new THREE.Vector2(157,345)));
  notchPath.add(new THREE.CubicBezierCurve(new THREE.Vector2(157,345),new THREE.Vector2(182,345),new THREE.Vector2(177,382),new THREE.Vector2(198,382)));
  notchPath.add(new THREE.CubicBezierCurve(new THREE.Vector2(198,382),new THREE.Vector2(219,382),new THREE.Vector2(214,345),new THREE.Vector2(239,345)));
  notchPath.add(new THREE.LineCurve(new THREE.Vector2(239,345),new THREE.Vector2(268,345)));
  const notch=stroke(notchPath.getPoints(120).map(p=>[p.x,p.y]),muted,2.4,.328);
  notch.name='amount-logo';
  const tick=stroke([[101,345],[113,345]],purple,2.5,.328);tick.name='amount-indicator';
  label('Amount',198,500,12,muted,'center');
  let amountLabel=label(`${values.amount.toFixed(2)} %`,198,542,34,ink,'center');
  const replaceLabel=(mesh,...args)=>{root.remove(mesh);mesh.geometry.dispose();return label(...args);};
  // The Pocket mark stays upright; only the knob and position indicator rotate.
  for(const mesh of [notch,tick]){mesh.geometry.translate(-px(198),-py(345),0);mesh.position.set(px(198),py(345),0);}
  function updateAmountAppearance(value){
    const end=amountStart+amountSweep*value/100;
    // The indicator and fill share one angle, including after a view rebuild.
    knob.rotation.z=Math.PI-end;tick.rotation.z=knob.rotation.z;
    amountArc.visible=value>0;
    const attribute=amountArc.geometry.attributes.position;
    const points=arc(amountStart,end,117);
    let vertex=0;
    for(let i=1;i<points.length;i++){
      const [ax,ay]=points[i-1],[bx,by]=points[i],dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy);
      const nx=length?-dy/length*1.25:0,ny=length?dx/length*1.25:0;
      const corners=[[ax+nx,ay+ny],[ax-nx,ay-ny],[bx+nx,by+ny],[bx-nx,by-ny]];
      for(const index of [0,1,2,2,1,3])attribute.setXYZ(vertex++,px(corners[index][0]),py(corners[index][1]),.09);
    }
    attribute.needsUpdate=true;
    amountArc.geometry.computeBoundingSphere();
  }
  updaters.amount=value=>{
    value=Math.max(0,Math.min(100,value));values.amount=value;
    amountLabel=replaceLabel(amountLabel,`${value.toFixed(2)} %`,198,542,34,ink,'center');
    updateAmountAppearance(value);
  };
  updateAmountAppearance(values.amount);
  cap.userData.control='amount';targets.push(cap);
  const controls=interfaceControls.filter(control=>!control.details||details);
  controls.forEach(control=>{
    const {id,x,y,width,min,max,format}=control,left=x+10,right=x+width;
    label(control.label,x,y);let valueLabel=label(format(values[id]),x+width+10,y+17,11,ink,'right');
    // A recessed physical groove and raised violet slider puck.
    const rail=plate((left+right)/2,y+29,right-left,2,.008,grid,.8,.057);
    const fill=stroke([[left,y+29],[left+(right-left)*(values[id]-min)/(max-min),y+29]],purple,1.5,.077);
    const thumb=cylinder(left+(right-left)*(values[id]-min)/(max-min),y+29,5.3,.055,purple,.105);
    const top=cylinder(left+(right-left)*(values[id]-min)/(max-min),y+29,4.2,.009,white,.139);
    const hit=add(new THREE.Mesh(new THREE.PlaneGeometry((right-left+20)/100,.30),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false})),(left+right)/2,y+29,.18);
    materials.push(hit.material);hit.userData.control=id;thumb.userData.control=id;targets.push(hit,thumb);
    updaters[id]=value=>{
      values[id]=value;const position=left+(right-left)*(value-min)/(max-min);thumb.position.x=top.position.x=px(position);
      root.remove(fill); // Replace the filled segment without changing the rail.
      if(updaters[id].fill){root.remove(updaters[id].fill);updaters[id].fill.geometry.dispose();}
      else fill.geometry.dispose();
      updaters[id].fill=stroke([[left,y+29],[position,y+29]],purple,1.5,.077);
      valueLabel=replaceLabel(valueLabel,format(value),x+width+10,y+17,11,ink,'right');
    };
  });
  label('Stereo',385,646,14,ink);stroke([[471,638],[474,641],[477,638]],muted,1.5);
  function toggle(name,id,x,y,w){
    const material=basic(values[id]?'#d5c9eb':'#eeedf2');
    const button=plate(x+w/2,y-4,w,23,.025,material,5,.055);
    label(name,x+w/2,y,10,muted,'center',.10);button.userData.action=id;targets.push(button);
    updaters[id]=value=>{values[id]=value;material.color.set(value?'#d5c9eb':'#eeedf2');if(id==='bypass')reduction.visible=!value;};
  }
  toggle('Bypass','bypass',1173,53,58);
  toggle('Freeze','freeze',505,645,48);toggle('Delta','delta',570,645,43);toggle('Listen','listen',631,645,48);
  reduction.visible=!values.bypass;
  if(details)stroke([[38,675],[1242,675]],grid,1);
  label('Stevenson Nagathota',38,height-24,8);
  const detailsPlate=plate(1194,height-27,94,25,.035,details?basic('#e2deec'):faceMaterial,8,.05);
  detailsPlate.userData.action='details';targets.push(detailsPlate);
  label(details?'Details -':'Details +',1194,height-23,10,details?purple:muted,'center',.11);
  stroke([[1264,height],[1280,height-16]],muted,1);stroke([[1270,height],[1280,height-10]],muted,1);
  return {root,height,targets,controls,update(id,value){updaters[id]?.(value);onChange?.(id,value);},dispose(){root.traverse(object=>object.geometry?.dispose());materials.forEach(material=>material.dispose());}};
}
