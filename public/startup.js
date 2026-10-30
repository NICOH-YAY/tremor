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
