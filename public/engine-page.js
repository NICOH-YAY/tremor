import {setupSettings} from './settings-ui.js';

const canvas=document.querySelector('canvas'), ctx=canvas.getContext('2d',{alpha:false});
const image=ctx.createImageData(320,200), pixels=new Uint32Array(image.data.buffer);let engine,starting=false;
let masterGain,musicNode,musicGain;
const audio={context:null,channels:new Map(),buffers:new Map(),
 params(c,v,s){const ch=this.channels.get(c);if(ch){ch.gain.gain.value=v/127*(ch.boost||1);ch.pan.pan.value=(s-127)/127;}},
 stop(c){const ch=this.channels.get(c);if(ch){ch.source.stop();this.channels.delete(c);}},
 playing(c){return this.channels.has(c);},
 impact(volume,gun){const ac=this.context,n=Math.floor(ac.sampleRate*.1),b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);let seed=17;for(let i=0;i<n;i++){const t=i/ac.sampleRate;seed=(Math.imul(seed,1664525)+1013904223)|0;d[i]=Math.sin(2*Math.PI*(gun?64:44)*t)*Math.exp(-t*45)+(gun?(seed/2147483648)*Math.exp(-t*170)*.65:0);}const src=ac.createBufferSource(),g=ac.createGain();src.buffer=b;g.gain.value=volume;src.connect(g).connect(masterGain);src.start();},
 play(c,bytes,rate,v,s,name){if(!this.context)return;this.stop(c);const buffer=this.context.createBuffer(1,bytes.length,rate);const pcm=buffer.getChannelData(0);for(let i=0;i<bytes.length;i++)pcm[i]=(bytes[i]-128)/128;const source=this.context.createBufferSource(),gain=this.context.createGain(),pan=this.context.createStereoPanner();source.buffer=buffer;source.connect(gain).connect(pan).connect(masterGain);const gun=settings.state.intensity==='shocking'&&['pistol','shotgn','dshtgn'].includes(name);const ch={source,gain,pan,boost:gun?1.35:1};if(gun||name==='punch')this.impact(gun?v/127*.38:v/127*.3,gun);this.channels.set(c,ch);this.params(c,v,s);source.onended=()=>{if(this.channels.get(c)===ch)this.channels.delete(c);};source.start();}
};
async function start(file){if(starting)return;starting=true;document.querySelector('#play').disabled=document.querySelector('#load').disabled=true;
 try{audio.context=new AudioContext();masterGain=audio.context.createGain();masterGain.connect(audio.context.destination);await audio.context.resume();const bytes=file?new Uint8Array(await file.arrayBuffer()):new Uint8Array(await (await fetch(new URL('./wad/freedoom1.wad',import.meta.url))).arrayBuffer());
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const magic=new TextDecoder().decode(bytes.subarray(0,4));if(bytes.length<12||magic!=='IWAD')throw Error('Select a supported Doom IWAD.');const count=view.getInt32(4,true),offset=view.getInt32(8,true);if(count<0||offset<12||offset+count*16>bytes.length)throw Error('Invalid WAD directory.');
 const {default:createDoom}=await import(/* @vite-ignore */ new URL('./engine/doom.js',import.meta.url).href);
 engine=await createDoom({audio,onIntro(){return new Promise(resolve=>{release();document.querySelector('#intro').hidden=false;document.querySelector('#continue').onclick=()=>{document.querySelector('#intro').hidden=true;resolve();canvas.focus();};});},onFrame(ptr){
 // Reuse a view until WASM memory grows; no typed-array allocation per blit.
 if(frameBuffer!==engine.HEAPU8.buffer||framePointer!==ptr){frameBuffer=engine.HEAPU8.buffer;framePointer=ptr;framePixels=new Uint32Array(frameBuffer,ptr,320*200);}
 for(let i=0;i<framePixels.length;i++){const p=framePixels[i];pixels[i]=0xff000000|(p&0xff00)|((p&255)<<16)|((p>>>16)&255);}ctx.putImageData(image,0,0);
 frames++;const now=performance.now();if(now-fpsTime>=1000){fps.textContent=(frames*1000/(now-fpsTime)).toFixed(0)+' FPS';frames=0;fpsTime=now;}
 },printErr:console.error});
 engine.FS.mkdir('/persist');engine.FS.mount(engine.IDBFS,{},'/persist');
 await new Promise((resolve,reject)=>engine.FS.syncfs(true,e=>e?reject(e):resolve()));
 engine.FS.chdir('/persist');
 let syncing=false,dirty=false;engine.flushSaves=()=>{document.querySelector('#save-status').textContent='Saving?';dirty=true;if(syncing)return;const flush=()=>{dirty=false;syncing=true;engine.FS.syncfs(false,e=>{syncing=false;document.querySelector('#save-status').textContent=e?'Save persistence failed: '+e:'Saved in this browser';if(dirty)flush();});};flush();};
 engine._tremor_music_rate(audio.context.sampleRate);
 musicGain=audio.context.createGain();musicGain.connect(masterGain);
 // ScriptProcessor is a compatibility fallback that pulls directly from WASM.
 musicNode=audio.context.createScriptProcessor(2048,0,2);musicNode.onaudioprocess=e=>{const l=e.outputBuffer.getChannelData(0),r=e.outputBuffer.getChannelData(1);if(settings.opened){l.fill(0);r.fill(0);return;}const ptr=engine._tremor_music_render(l.length)>>1;const heap=engine.HEAP16;for(let i=0;i<l.length;i++){l[i]=heap[ptr+i*2]/32768;r[i]=heap[ptr+i*2+1]/32768;}};musicNode.connect(musicGain);
 settings.apply();engine.onSettingsReady=()=>settings.apply();
 engine.FS.writeFile('/game.wad',bytes);engine.FS.writeFile('/tremor.wad',new Uint8Array(await (await fetch(new URL('./wad/tremor.wad',import.meta.url))).arrayBuffer()));document.querySelector('#title').style.display='none';document.querySelector('#game').style.display='block';canvas.focus();engine.callMain(['-iwad','/game.wad','-file','/tremor.wad','-config','/persist/default.cfg','-extraconfig','/persist/doom.cfg']);
 }catch(e){document.querySelector('#error').textContent=String(e);starting=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
document.querySelector('#play').onclick=()=>start();document.querySelector('#load').onclick=()=>document.querySelector('#wad').click();document.querySelector('#wad').onchange=e=>{if(e.target.files[0])start(e.target.files[0]);};

const held=new Set();
function dispatch(code,down){const item=settings.table.get(code);if(item&&item.action!==21){engine._tremor_input(item.slot,down?1:0);return true;}return false;}
function key(e,down){if(!engine||settings.opened||!document.querySelector('#intro').hidden)return;
 // Navigation keys remain available for Doom's menus.
 const nav={Enter:13,Backspace:127,ArrowUp:173,ArrowDown:175,ArrowLeft:172,ArrowRight:174};
 if(down&&held.has(e.code))return;if(down)held.add(e.code);else held.delete(e.code);
 if(dispatch(e.code,down))e.preventDefault();else if(engine._tremor_menu_active()&&nav[e.code]){engine._web_key(nav[e.code],down?1:0);e.preventDefault();}}
window.addEventListener('keydown',e=>key(e,true));window.addEventListener('keyup',e=>key(e,false));
function release(){if(engine){for(let i=0;i<512;i++)engine._tremor_input(i,0);for(const k of [13,127,173,175,172,174])engine._web_key(k,0);engine._web_mouse(0,0);}held.clear();mouseX=0;}
let mouseX=0,frameBuffer,framePointer,framePixels,frames=0,fpsTime=performance.now();
const fps=document.createElement('span');fps.id='fps';document.body.append(fps);
const settings=setupSettings({getEngine:()=>engine,release,onApply(s){if(masterGain)masterGain.gain.value=s.master/100;fps.hidden=!s.fps;resize(s);},onClose(){canvas.focus();}});
function resize(s=settings.state){if(s.scale==='integer'){const n=Math.max(1,Math.floor(Math.min(innerWidth/320,(innerHeight-70)/240)));canvas.style.width=320*n+'px';canvas.style.height=240*n+'px';}else{canvas.style.width='';canvas.style.height='';}}
window.addEventListener('resize',()=>resize());window.addEventListener('blur',release);
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement!==canvas)release();});
canvas.onclick=()=>{if(!settings.opened){audio.context?.resume();canvas.requestPointerLock();}};
document.addEventListener('mousemove',e=>{if(engine&&!settings.opened&&document.pointerLockElement===canvas){mouseX+=e.movementX;}});
// Accumulate all events, smooth at a stable presentation cadence, retain fractional motion.
function motion(){if(engine&&!settings.opened){const amount=settings.state.smoothing?mouseX*.5:mouseX;const dx=Math.trunc(amount*settings.state.sensitivity*8);if(dx){mouseX-=dx/(settings.state.sensitivity*8);engine._web_mouse(0,dx);}}requestAnimationFrame(motion);}requestAnimationFrame(motion);
canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('mousedown',e=>{if(engine&&!settings.opened&&document.pointerLockElement===canvas){e.preventDefault();dispatch('Mouse'+e.button,true);held.add('Mouse'+e.button);}});
window.addEventListener('mouseup',e=>{if(engine){dispatch('Mouse'+e.button,false);held.delete('Mouse'+e.button);}});
