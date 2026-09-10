export const defaultInterfaceValues = { amount:18, low:20, high:20000, mix:100, attack:10, release:120, reduction:12, smoothing:55, focus:50, sensitivity:0, bypass:false, freeze:false, delta:false, listen:false };
export const interfaceControls = [
  {id:'low',label:'Low cut',min:20,max:20000,x:392,y:579,width:254,format:v=>`${v.toFixed(2)} Hz`},
  {id:'high',label:'High cut',min:20,max:20000,x:684,y:579,width:254,format:v=>`${(v/1000).toFixed(2)} kHz`},
  {id:'mix',label:'Mix',min:0,max:100,x:976,y:579,width:254,format:v=>`${v.toFixed(2)} %`},
  {id:'attack',label:'Attack',min:0,max:30,x:40,y:711,width:366,format:v=>`${v.toFixed(2)} ms`,details:true},
  {id:'release',label:'Release',min:0,max:300,x:452,y:711,width:366,format:v=>`${v.toFixed(2)} ms`,details:true},
  {id:'reduction',label:'Max reduction',min:0,max:24,x:864,y:711,width:366,format:v=>`${v.toFixed(2)} dB`,details:true},
  {id:'smoothing',label:'Smoothing',min:0,max:100,x:40,y:781,width:366,format:v=>`${v.toFixed(2)} %`,details:true},
  {id:'focus',label:'Focus',min:0,max:100,x:452,y:781,width:366,format:v=>`${v.toFixed(2)} %`,details:true},
  {id:'sensitivity',label:'Sensitivity',min:-12,max:12,x:864,y:781,width:366,format:v=>`${v.toFixed(2)} dB`,details:true},
];

