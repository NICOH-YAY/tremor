// One listener and one completion resolve every concurrent engine intro waiter.
export function createIntroGate(card, button, before=()=>{}, after=()=>{}) {
 let complete=false; const waiters=new Set();
 button.addEventListener('click',()=>{complete=true;card.hidden=true;for(const resolve of waiters)resolve();waiters.clear();after();},{once:true});
 return {wait(){if(complete)return Promise.resolve();before();card.hidden=false;return new Promise(resolve=>waiters.add(resolve));}};
}
// Called only by the canvas click handler. Detached/cross-document locks may reject.
export async function requestCanvasLock(canvas){try{await canvas.requestPointerLock();}catch{/* Capture is optional; a later click can retry. */}}
