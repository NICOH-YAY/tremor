// One listener and one completion resolve every concurrent engine intro waiter.
export function createIntroGate(card, button, before=()=>{}, after=()=>{}) {
 let complete=false; const waiters=new Set();
 const finish=()=>{if(complete)return;complete=true;card.hidden=true;for(const resolve of waiters)resolve();waiters.clear();after();};
 button.addEventListener('click',finish,{once:true});
 card.addEventListener?.('click',finish,{once:true});
 globalThis.addEventListener?.('keydown',e=>{if(!card.hidden){e.preventDefault();e.stopImmediatePropagation();finish();}});
 return {wait(){if(complete)return Promise.resolve();before();card.hidden=false;return new Promise(resolve=>waiters.add(resolve));}};
}
// Called only by the canvas click handler. Detached/cross-document locks may reject.
export async function requestCanvasLock(canvas){try{await canvas.requestPointerLock();}catch{/* Capture is optional; a later click can retry. */}}

// Structural validation precedes every AudioContext or engine allocation.
export function validateIWAD(bytes){
 if(bytes.length<12||new TextDecoder().decode(bytes.subarray(0,4))!=='IWAD')throw Error('Select a supported Doom IWAD.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),count=view.getInt32(4,true),offset=view.getInt32(8,true);
 if(count<=0||offset<12||offset+count*16>bytes.length)throw Error('Invalid WAD directory.');
 const names=new Set(),decoder=new TextDecoder();
 for(let i=0;i<count;i++){const at=offset+i*16,start=view.getInt32(at,true),size=view.getInt32(at+4,true);if(start<0||size<0||start+size>bytes.length)throw Error('Invalid WAD lump.');names.add(decoder.decode(bytes.subarray(at+8,at+16)).replace(/\0.*$/,''));}
 for(const name of ['E1M1','PLAYPAL','COLORMAP','PNAMES','TEXTURE1'])if(!names.has(name))throw Error('Unsupported IWAD: missing '+name);
}
