import { useEffect, useRef, useState } from 'react';
import { defaultInterfaceValues, interfaceControls } from './pocketInterfaceControls.js';

export default function PocketInterface3D({ details, onDetailsChange }) {
  const host=useRef(null), wrapper=useRef(null), api=useRef(null);
  const detailsCallback=useRef(onDetailsChange);detailsCallback.current=onDetailsChange;
  const latestDetails=useRef(details), values=useRef({...defaultInterfaceValues});
  latestDetails.current=details;
  const [view,setView]=useState('3d'),[expanded,setExpanded]=useState(false),[error,setError]=useState('');
  const [displayValues,setDisplayValues]=useState({...defaultInterfaceValues});
  const viewRef=useRef(view);viewRef.current=view;
  useEffect(()=>{api.current?.rebuild(details);},[details]);
  useEffect(()=>{api.current?.setView(view);},[view]);
  useEffect(()=>{
    const onFullscreen=()=>setExpanded(document.fullscreenElement===wrapper.current);
    document.addEventListener('fullscreenchange',onFullscreen);
    return()=>document.removeEventListener('fullscreenchange',onFullscreen);
  },[]);
  useEffect(()=>{
    let disposed=false,cleanup;
    Promise.all([import('three'),import('./buildPocketInterface.js')]).then(([THREE,{buildPocketInterface}])=>{
      if(disposed)return;
      const el=host.current;
      let renderer;
      try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch{setError('3D rendering is unavailable in this browser. Try a browser with WebGL enabled.');return;}
      // Render directly at the display's native resolution. No bitmap text,
      // texture filtering, continuous camera motion, or CSS canvas scaling.
      renderer.setPixelRatio(window.devicePixelRatio||1);
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000,0);
      const scene=new THREE.Scene();
      const camera=new THREE.OrthographicCamera(-6.7,6.7,4,-4,.1,100);camera.position.z=20;
      scene.add(new THREE.HemisphereLight(0xffffff,0x9e91af,2.1));
      const key=new THREE.DirectionalLight(0xffffff,2.5);key.position.set(-4,7,9);scene.add(key);
      const fill=new THREE.DirectionalLight(0xc9b6ed,.7);fill.position.set(7,-2,4);scene.add(fill);
      let model,frame=0,drag=null;
      const draw=()=>{frame=0;if(!disposed)renderer.render(scene,camera);};
      const invalidate=()=>{if(!frame)frame=requestAnimationFrame(draw);};
      const resize=()=>{
        const {width,height}=el.getBoundingClientRect();if(!width||!height||!model)return;
        renderer.setPixelRatio(window.devicePixelRatio||1);renderer.setSize(width,height);
        const aspect=width/height;
        const halfWidth=Math.max(6.5,(model.height/200+.16)*aspect);
        camera.left=-halfWidth;camera.right=halfWidth;camera.top=halfWidth/aspect;camera.bottom=-halfWidth/aspect;
        camera.updateProjectionMatrix();invalidate();
      };
      const setView=value=>{if(!model)return;model.root.rotation.set(value==='front'?0:.075,value==='front'?0:-.13,0);invalidate();};
      const rebuild=detail=>{
        if(model){scene.remove(model.root);model.dispose();}
        model=buildPocketInterface(THREE,detail,values.current,()=>setDisplayValues({...values.current}));
        scene.add(model.root);setView(viewRef.current);resize();
      };
      el.appendChild(renderer.domElement);rebuild(latestDetails.current);
      const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
      const point=event=>{
        const rect=el.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
        scene.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);
      };
      const down=event=>{
        if(event.button!==0)return;
        point(event);const hit=ray.intersectObjects(model.targets,false)[0];
        if(!hit)return;
        const action=hit.object.userData.action;
        if(action){if(action==='details')detailsCallback.current?.(!latestDetails.current);else model.update(action,!values.current[action]);invalidate();return;}
        const id=hit.object.userData.control;
        drag={id,y:event.clientY,value:values.current[id]};
        el.setPointerCapture(event.pointerId);event.preventDefault();
        move(event);
      };
      const move=event=>{
        point(event);
        if(!drag){el.style.cursor=ray.intersectObjects(model.targets,false).length?'grab':'default';return;}
        el.style.cursor='grabbing';
        if(drag.id==='amount')model.update('amount',Math.max(0,Math.min(100,drag.value+(drag.y-event.clientY)*.35)));
        else{
          const normal=new THREE.Vector3(0,0,1).applyQuaternion(model.root.quaternion);
          const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,new THREE.Vector3(0,0,.1).applyMatrix4(model.root.matrixWorld));
          const world=ray.ray.intersectPlane(plane,new THREE.Vector3());
          if(world){const local=model.root.worldToLocal(world),control=model.controls.find(c=>c.id===drag.id);const pixelX=local.x*100+640;const fraction=Math.max(0,Math.min(1,(pixelX-control.x-10)/(control.width-10)));model.update(drag.id,control.min+fraction*(control.max-control.min));}
        }
        invalidate();
      };
      const up=event=>{drag=null;el.style.cursor='default';if(el.hasPointerCapture(event.pointerId))el.releasePointerCapture(event.pointerId);};
      const lost=event=>{event.preventDefault();setError('The 3D view was interrupted. Reload the page to restore it.');};
      el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
      renderer.domElement.addEventListener('webglcontextlost',lost);
      const observer=new ResizeObserver(resize);observer.observe(el);window.addEventListener('resize',resize);
      api.current={rebuild,setView,update(id,value){model.update(id,value);invalidate();},reset(){Object.assign(values.current,defaultInterfaceValues);setDisplayValues({...values.current});rebuild(latestDetails.current);}};
      cleanup=()=>{
        cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',resize);
        el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);
        renderer.domElement.removeEventListener('webglcontextlost',lost);model.dispose();renderer.dispose();renderer.domElement.remove();
      };
    }).catch(()=>{if(!disposed)setError('The 3D view couldn’t load. Refresh the page to try again.');});
    return()=>{disposed=true;api.current=null;cleanup?.();};
  },[]);
  const update=(id,value)=>api.current?.update(id,Number(value));
  return <div className="pk-interface-model pk-mesh-model" ref={wrapper}>
    <div className="pk-interface-stage" ref={host} style={{aspectRatio:`1300 / ${details?932:752}`}} role="img" aria-label={`Pocket ${details?'Details':'Overview'} interface built from 3D geometry. Use the controls below for keyboard adjustments.`}>{error&&<p className="pk-model-error" role="alert">{error}</p>}</div>
    <div className="pk-interface-model-controls"><span>Drag the dial and sliders · Visual preview</span><div className="pk-model-actions"><button type="button" aria-pressed={view==='front'} onClick={()=>setView(view==='front'?'3d':'front')}>{view==='front'?'3D view':'Front view'}</button><button type="button" onClick={()=>api.current?.reset()}>Reset</button><button type="button" onClick={async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await wrapper.current.requestFullscreen();}catch{setError('Full screen isn’t available in this browser.');}}}>{expanded?'Exit full screen':'Full screen'}</button></div></div>
    <details className="pk-model-keyboard"><summary>Adjust preview controls</summary><div>{[{id:'amount',label:'Amount',min:0,max:100,format:v=>`${v.toFixed(2)} %`},...interfaceControls.filter(c=>!c.details||details)].map(control=><label key={control.id}><span>{control.label}<output>{control.format(displayValues[control.id])}</output></span><input aria-label={control.label} type="range" min={control.min} max={control.max} step="0.01" value={displayValues[control.id]} onChange={event=>update(control.id,event.target.value)}/></label>)}</div><div className="pk-model-switches">{['bypass','freeze','delta','listen'].map(id=><button key={id} type="button" aria-pressed={Boolean(displayValues[id])} onClick={()=>api.current?.update(id,!displayValues[id])}>{id[0].toUpperCase()+id.slice(1)}</button>)}</div></details>
  </div>;
}
