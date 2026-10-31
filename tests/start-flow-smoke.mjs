// Run in a killable child: an in-process timer cannot detect a WASM busy loop.
import {Window} from 'happy-dom';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import createDoom from '../public/engine/doom.js?real';
import {defaults,storageKey} from '../public/settings-store.js';
const window=new Window({url:'http://localhost/'});
window.document.write(readFileSync(new URL('../index.html',import.meta.url),'utf8').replace(/<script[\s\S]*?<\/script>/g,''));
for(const name of ['window','document','localStorage','location','ResizeObserver'])globalThis[name]=window[name];
globalThis.addEventListener=window.addEventListener.bind(window);
Object.assign(globalThis,{innerWidth:800,innerHeight:600,devicePixelRatio:1});
let rafs=0;
globalThis.requestAnimationFrame=fn=>setTimeout(()=>{rafs++;fn(performance.now());},16);
const context={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>({addColorStop(){}}),createPattern:()=>({})};
for(const name of ['fillRect','putImageData','drawImage','save','restore'])context[name]=()=>{};
window.HTMLCanvasElement.prototype.getContext=()=>context;
class Param {
 _value=0;
 get value(){return this._value;}
 set value(v){this.check(v);this._value=v;}
 check(...values){if(!values.every(Number.isFinite))throw Error('Non-finite AudioParam');}
 setTargetAtTime(...v){this.check(...v);}
 setValueAtTime(...v){this.check(...v);}
 linearRampToValueAtTime(...v){this.check(...v);}
 exponentialRampToValueAtTime(...v){this.check(...v);}
 cancelScheduledValues(...v){this.check(...v);}
}
class Node {
 constructor(){for(const key of ['gain','frequency','Q','detune','playbackRate','pan','threshold','knee','ratio','attack','release'])this[key]=new Param();}
 connect(node){return node;} disconnect(){} start(){} stop(){}
}
let processor,callbacks=0,callMain=0,intros=0,frames=0,engine;
class AudioContext {
 sampleRate=44100;currentTime=0;destination=new Node();
 resume(){return Promise.resolve();} close(){return Promise.resolve();}
 createBuffer(channels,length){const data=Array.from({length:channels},()=>new Float32Array(Math.floor(length)));return {getChannelData:i=>data[i]};}
 createScriptProcessor(){processor=new Node();return processor;}
}
for(const name of ['Gain','DynamicsCompressor','BiquadFilter','Oscillator','Convolver','BufferSource','WaveShaper','StereoPanner'])AudioContext.prototype['create'+name]=()=>new Node();
globalThis.AudioContext=AudioContext;
globalThis.fetch=async url=>{const data=readFileSync(new URL(String(url)));return new Response(data);};
localStorage.setItem(storageKey,JSON.stringify({...defaults(),musicStyle:process.argv[2]||'layered'}));
// Only replace browser persistence; all engine exports and startup callbacks are real.
globalThis.startFlowDoom=async options=>{
 const onIntro=options.onIntro,onFrame=options.onFrame;
 engine=await createDoom({...options,print(){},onIntro(){intros++;return onIntro();},onFrame(p){frames++;onFrame(p);}});
 engine.FS.mount=()=>{};engine.FS.syncfs=(_populate,done)=>done(null);
 const main=engine.callMain;engine.callMain=args=>{callMain++;return main(args);};
 return engine;
};
registerHooks({load(url,context,next){if(url===new URL('../public/engine/doom.js',import.meta.url).href)return {format:'module',source:'export default globalThis.startFlowDoom;',shortCircuit:true};return next(url,context);}});
await import('../public/engine-page.js');
document.querySelector('#play').click();
const timer=setInterval(()=>{
 const error=document.querySelector('#error').textContent;if(error){console.error(error);process.exit(1);}
 if(intros&& !document.querySelector('#intro').hidden){document.querySelector('#continue').click();}
 if(frames>=3){
  for(let i=0;i<3;i++){const channels=[new Float32Array(2048),new Float32Array(2048)];processor.onaudioprocess({outputBuffer:{getChannelData:i=>channels[i]}});if(!channels.every(c=>c.every(Number.isFinite)))throw Error('Non-finite audio');callbacks++;}
  // Settings must remain safe and live after level initialization too.
  document.querySelector('#settings-gear').click();
  const slider=document.querySelector('#options input[type=range]');slider.dispatchEvent(new window.Event('input'));
  console.log(JSON.stringify({callMain,intros,frames,callbacks,rafs}));clearInterval(timer);process.exit(0);
 }
},10);

