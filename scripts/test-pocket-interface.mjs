import assert from 'node:assert/strict';
import { build } from 'esbuild';
import * as THREE from 'three';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const directory=await mkdtemp(join(tmpdir(),'pocket-interface-'));
try{
 const output=join(directory,'builder.mjs');
 await build({entryPoints:['src/components/buildPocketInterface.js'],bundle:true,platform:'node',format:'esm',outfile:output});
 const {buildPocketInterface,defaultInterfaceValues}=await import(pathToFileURL(output));
 for(const details of [false,true]){
  const values={...defaultInterfaceValues},model=buildPocketInterface(THREE,details,values);
  assert.equal(model.controls.length,details?9:3);
  let count=0;
  model.root.traverse(object=>{
   if(!object.isMesh)return;count++;
   assert.ok(Array.from(object.geometry.attributes.position.array).every(Number.isFinite));
   for(const material of Array.isArray(object.material)?object.material:[object.material])assert.ok(!material.map,'No text or control can be a bitmap texture');
  });
  const box=new THREE.Box3().setFromObject(model.root);assert.ok(box.max.z-box.min.z>.5,'Panel and raised dial have real depth');
  const fill=model.root.getObjectByName('amount-fill');
  const indicator=model.root.getObjectByName('amount-indicator');
  const logo=model.root.getObjectByName('amount-logo');
  const fillGeometry=fill.geometry;
  let previousLength=-1;
  for(const value of [0,18,50,100]){
    model.update('amount',value);assert.equal(values.amount,value);
    assert.equal(fill.visible,value>0);
    assert.equal(fill.geometry,fillGeometry,'Dragging reuses the fill geometry');
    assert.equal(logo.rotation.z,0,'Logo stays upright');
    const positions=fill.geometry.attributes.position;
    let length=0;
    for(let i=0;i<positions.count;i+=6){
      const start=new THREE.Vector2((positions.getX(i)+positions.getX(i+1))/2,(positions.getY(i)+positions.getY(i+1))/2);
      const end=new THREE.Vector2((positions.getX(i+2)+positions.getX(i+5))/2,(positions.getY(i+2)+positions.getY(i+5))/2);
      length+=start.distanceTo(end);
    }
    assert.ok(length>previousLength,'Fill grows as Amount increases');previousLength=length;
    const n=positions.count;
    const endDirection=new THREE.Vector2((positions.getX(n-4)+positions.getX(n-1))/2+4.42,(positions.getY(n-4)+positions.getY(n-1))/2-(model.height/200-3.45)).normalize();
    const tickDirection=new THREE.Vector2(-Math.cos(indicator.rotation.z),-Math.sin(indicator.rotation.z));
    assert.ok(endDirection.dot(tickDirection)>.99999,'Fill endpoint tracks the indicator');
  }
  model.update('amount',67);
  const rebuilt=buildPocketInterface(THREE,!details,{...values});
  assert.equal(rebuilt.root.getObjectByName('amount-indicator').rotation.z,indicator.rotation.z,'View changes preserve fill position');
  assert.deepEqual([...rebuilt.root.getObjectByName('amount-fill').geometry.attributes.position.array].filter((_,i)=>i%3===0),[...fill.geometry.attributes.position.array].filter((_,i)=>i%3===0),'Rebuilt fill preserves its horizontal geometry');
  rebuilt.dispose();model.update('amount',18);
  for(const c of model.controls){for(const v of [c.min,c.max,defaultInterfaceValues[c.id]]){model.update(c.id,v);assert.equal(values[c.id],v);}}
  for(const id of ['bypass','freeze','delta','listen']){model.update(id,true);assert.equal(values[id],true);model.update(id,false);}
  model.root.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(new THREE.Vector3(-4.42,model.height/200-3.45,5),new THREE.Vector3(0,0,-1));
  assert.equal(ray.intersectObjects(model.targets)[0]?.object.userData.control,'amount','Raised dial is draggable');
  assert.ok(model.targets.some(mesh=>mesh.userData.action==='details'));
  console.log(`PASS: ${details?'Details':'Overview'} | ${count} meshes, vector-only rendering, control limits, toggles, and dial hit testing`);
  model.dispose();
 }
}finally{await rm(directory,{recursive:true,force:true});}
