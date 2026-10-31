import {musicMix,createOPLStream} from './music.js';
import {createIntroGate, requestCanvasLock, validateIWAD} from './startup.js';
import {createHorror} from './horror.js';
import {setupSettings} from './settings-ui.js';

const canvas=document.querySelector('canvas'), ctx=canvas.getContext('2d',{alpha:false});
const raster=document.createElement('canvas');raster.width=320;raster.height=200;const rasterCtx=raster.getContext('2d');const upscale=document.createElement('canvas');const upscaleCtx=upscale.getContext('2d');
let displayRect=canvas.getBoundingClientRect();new ResizeObserver(()=>{displayRect=canvas.getBoundingClientRect();}).observe(canvas);
const image=ctx.createImageData(320,200), pixels=new Uint32Array(image.data.buffer);let engine,enginePromise,starting=false;
const introGate=createIntroGate(document.querySelector('#intro'),document.querySelector('#continue'),()=>{release();horror?.intro();},()=>canvas.focus());
let masterGain,musicNode,musicGain,horror,monsterReverb,musicConnected=false,musicBus,musicFilter;
const audio={context:null,channels:new Map(),buffers:new Map(),
 params(c,v,s){const ch=this.channels.get(c);if(ch){ch.gain.gain.value=v/127*(ch.boost||1);ch.pan.pan.value=(s-127)/127;}},
 stop(c){const ch=this.channels.get(c);if(ch){ch.source.stop();ch.cleanup?.();this.channels.delete(c);}},
 playing(c){return this.channels.has(c);},
 mutter(prewarm=false){const ac=this.context,b=this.buffers.get('mutter')||ac.createBuffer(1,Math.floor(ac.sampleRate*.3),ac.sampleRate),d=b.getChannelData(0);if(!this.buffers.has('mutter')){for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(Math.sin(i/d.length*Math.PI*5),2)*(1-i/d.length);this.buffers.set('mutter',b);}if(prewarm)return;const source=ac.createBufferSource(),filter=ac.createBiquadFilter(),g=ac.createGain();source.buffer=b;filter.type='bandpass';filter.frequency.value=180+Math.random()*350;filter.Q.value=5;g.gain.value=.06;source.connect(filter).connect(g).connect(masterGain);source.start();source.onended=()=>{source.disconnect();filter.disconnect();g.disconnect();};},
 impact(volume,gun,prewarm=false){const ac=this.context,n=Math.floor(ac.sampleRate*.1),b=this.buffers.get('impact'+gun)||ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);let seed=17;if(!this.buffers.has('impact'+gun)){for(let i=0;i<n;i++){const t=i/ac.sampleRate;seed=(Math.imul(seed,1664525)+1013904223)|0;d[i]=Math.sin(2*Math.PI*(gun?64:44)*t)*Math.exp(-t*45)+(gun?(seed/2147483648)*Math.exp(-t*170)*.65:0);}this.buffers.set('impact'+gun,b);}if(prewarm)return;const src=ac.createBufferSource(),g=ac.createGain();src.buffer=b;g.gain.value=volume;src.connect(g).connect(masterGain);src.start();src.onended=()=>{src.disconnect();g.disconnect();};},
 play(c,bytes,rate,v,s,name){if(!this.context)return;if(name==='posact')this.mutter();this.stop(c);const key=name+':'+rate+':'+bytes.length;let buffer=this.buffers.get(key);if(!buffer){buffer=this.context.createBuffer(1,bytes.length,rate);const pcm=buffer.getChannelData(0);for(let i=0;i<bytes.length;i++)pcm[i]=(bytes[i]-128)/128;this.buffers.set(key,buffer);}const source=this.context.createBufferSource(),gain=this.context.createGain(),pan=this.context.createStereoPanner();let filter;source.buffer=buffer;if(/^(posit|posact|popain|podth|bgsit|bgact|bgpain|bgdth|sgtsit|sgtatk|sgtdth|cacsit|cacdth|brssit|brsdth|sklatk|skldth)/.test(name)){source.playbackRate.value=.7+Math.random()*.2;gain.connect(monsterReverb);filter=this.context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=700+v/127*5000;source.connect(filter).connect(gain);}else source.connect(gain).connect(pan).connect(masterGain);const gun=settings.state.intensity==='shocking'&&['pistol','shotgn','dshtgn'].includes(name);const ch={source,gain,pan,boost:gun?1.35:1,cleanup(){source.disconnect();gain.disconnect();pan.disconnect();filter?.disconnect();}};if(gun||name==='punch')this.impact(gun?v/127*.38:v/127*.3,gun);this.channels.set(c,ch);this.params(c,v,s);source.onended=()=>{ch.cleanup();if(this.channels.get(c)===ch)this.channels.delete(c);};source.start();}
};
const progress=document.createElement('progress');progress.style.cssText='display:none;width:280px';document.querySelector('#title').append(progress);
async function download(url){progress.style.display='block';const r=await fetch(url);if(!r.ok)throw Error('Download failed: '+r.status);const total=Number(r.headers.get('content-length')),reader=r.body?.getReader();if(!reader)return new Uint8Array(await r.arrayBuffer());const chunks=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);size+=value.length;if(total){progress.max=total;progress.value=size;}else progress.removeAttribute('value');}const data=new Uint8Array(size);let at=0;for(const chunk of chunks){data.set(chunk,at);at+=chunk.length;}return data;}
async function start(file){if(starting)return;starting=true;document.querySelector('#play').disabled=document.querySelector('#load').disabled=true;
 try{const bytes=file?new Uint8Array(await file.arrayBuffer()):await download(new URL('./wad/freedoom1.wad',import.meta.url));
 validateIWAD(bytes);
 const modBytes=await download(new URL('./wad/tremor.wad',import.meta.url));
 audio.context=new AudioContext();masterGain=audio.context.createGain();masterGain.connect(audio.context.destination);await audio.context.resume();audio.mutter(true);audio.impact(0,false,true);audio.impact(0,true,true);musicBus=audio.context.createDynamicsCompressor();musicBus.threshold.value=-16;musicBus.knee.value=12;musicBus.ratio.value=3;musicBus.attack.value=.012;musicBus.release.value=.3;musicBus.connect(masterGain);horror=createHorror(raster,audio.context,masterGain,canvas,musicBus);
 monsterReverb=audio.context.createConvolver();const impulse=audio.context.createBuffer(1,Math.floor(audio.context.sampleRate*.28),audio.context.sampleRate),ir=impulse.getChannelData(0);for(let i=0;i<ir.length;i++)ir[i]=(Math.random()*2-1)*Math.pow(1-i/ir.length,3)*.2;monsterReverb.buffer=impulse;monsterReverb.connect(masterGain); const {default:createDoom}=await import(/* @vite-ignore */ new URL('./engine/doom.js',import.meta.url).href);
 engine=await (enginePromise??=createDoom({noInitialRun:true,audio,onHint:id=>horror?.hint(id),onDamageDirection:b=>horror?.damage(b),onIntro:()=>introGate.wait(),onFrame(ptr){
 // Reuse a view until WASM memory grows; no typed-array allocation per blit.
 if(frameBuffer!==engine.HEAPU8.buffer||framePointer!==ptr){frameBuffer=engine.HEAPU8.buffer;framePointer=ptr;framePixels=new Uint32Array(frameBuffer,ptr,320*200);}
 for(let i=0;i<framePixels.length;i++){const p=framePixels[i];pixels[i]=0xff000000|(p&0xff00)|((p&255)<<16)|((p>>>16)&255);}rasterCtx.putImageData(image,0,0);horror?.frame(engine,settings.state);updateMusic(settings.state,false);

 const rect=displayRect,scale=Math.min(3,Math.max(1,Math.ceil(Math.max(rect.width*devicePixelRatio/320,rect.height*devicePixelRatio/200))));
 if(upscale.width!==320*scale){upscale.width=320*scale;upscale.height=200*scale;}
 upscaleCtx.imageSmoothingEnabled=false;upscaleCtx.drawImage(raster,0,0,upscale.width,upscale.height);
 // Backing store follows display pixels: integer nearest pre-scale, one smooth final resample.
 const w=Math.max(320,Math.round(rect.width*devicePixelRatio)),h=Math.max(200,Math.round(rect.height*devicePixelRatio));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 ctx.imageSmoothingEnabled=true;ctx.drawImage(upscale,0,0,canvas.width,canvas.height);
 frames++;const now=performance.now();if(now-fpsTime>=1000){fps.textContent=(frames*1000/(now-fpsTime)).toFixed(0)+' FPS';frames=0;fpsTime=now;}
 },printErr:console.error}));
 if(new URLSearchParams(location.search).get('debug')==='1')window.tremorDebug={engine,setTerror:n=>engine._tremor_debug_terror(n),giveRounds:n=>engine._tremor_debug_rounds(n),warp:map=>engine._tremor_debug_warp(Number(String(map).match(/(?:M)?([1-9])$/i)?.[1]||map))};
 engine.uiPaused=()=>settings.opened||historyDialog.open||helpDialog.open;
 engine.FS.mkdir('/persist');engine.FS.mount(engine.IDBFS,{},'/persist');
 await new Promise((resolve,reject)=>engine.FS.syncfs(true,e=>e?reject(e):resolve()));
 engine.FS.chdir('/persist');
 let syncing=false,dirty=false;engine.flushSaves=()=>{document.querySelector('#save-status').textContent='Saving...';dirty=true;if(syncing)return;const flush=()=>{dirty=false;syncing=true;engine.FS.syncfs(false,e=>{syncing=false;document.querySelector('#save-status').textContent=e?'Save persistence failed: '+e:'Saved in this browser';if(dirty)flush();});};flush();};
 engine._tremor_music_rate(audio.context.sampleRate);
 musicGain=audio.context.createGain();musicFilter=audio.context.createBiquadFilter();musicFilter.type='lowpass';musicFilter.Q.value=.5;musicGain.connect(musicFilter).connect(musicBus);
 // ScriptProcessor is a compatibility fallback that pulls directly from WASM.
 const stream=createOPLStream(n=>{const ptr=engine._tremor_music_render(n)>>1;return engine.HEAP16.subarray(ptr,ptr+n*2);});
 musicNode=audio.context.createScriptProcessor(2048,0,2);musicNode.onaudioprocess=e=>{const l=e.outputBuffer.getChannelData(0),r=e.outputBuffer.getChannelData(1);if(settings.opened||settings.state.musicStyle==='horror'){l.fill(0);r.fill(0);return;}stream(l,r,musicMix(settings.state.musicStyle,(engine._tremor_fear?.()||0)/100,0,settings.state.music).pitch);};if(settings.state.musicStyle!=='horror'){musicNode.connect(musicGain);musicConnected=true;}
 settings.apply();engine.onSettingsReady=()=>settings.apply();
 engine.FS.writeFile('/game.wad',bytes);engine.FS.writeFile('/tremor.wad',modBytes);document.querySelector('#title').style.display='none';document.querySelector('#game').style.display='block';canvas.focus();engine.callMain(['-iwad','/game.wad','-file','/tremor.wad','-config','/persist/default.cfg','-extraconfig','/persist/doom.cfg','-warp','1','1','-skill','3']);
 }catch(e){if(!enginePromise&&audio.context){await audio.context.close();audio.context=null;}document.querySelector('#error').textContent=String(e)+(enginePromise?' Reload the page to retry engine startup.':'');starting=!!enginePromise;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
document.querySelector('#play').onclick=()=>start();document.querySelector('#load').onclick=()=>document.querySelector('#wad').click();document.querySelector('#wad').onchange=e=>{if(e.target.files[0])start(e.target.files[0]);};

const held=new Set();
function dispatch(code,down){const item=settings.table.get(code);if(item?.action===19)horror?.map(down);if(item?.action===11)horror?.purge(down);if(item&&item.action>=22){if(down){if(item.action===24)engine._tremor_center_view();else engine._tremor_look(item.action===22?4:-4);}return true;}if(item&&item.action!==21){engine._tremor_input(item.slot,down?1:0);return true;}return false;}
function key(e,down){if(!engine||settings.opened||historyDialog.open||helpDialog.open||!document.querySelector('#intro').hidden)return;
 // Navigation keys remain available for Doom's menus.
 const nav={Enter:13,Backspace:127,ArrowUp:173,ArrowDown:175,ArrowLeft:172,ArrowRight:174},mapKeys={Equal:61,NumpadAdd:61,Minus:45,NumpadSubtract:45,Digit0:48};
 if(down&&e.code==='Escape')document.exitPointerLock?.();
 if(down&&held.has(e.code))return;if(down)held.add(e.code);else held.delete(e.code);
 if(dispatch(e.code,down))e.preventDefault();else if(mapKeys[e.code]&&(engine._tremor_automap_active()||!down)){engine._web_key(mapKeys[e.code],down?1:0);e.preventDefault();}else if(engine._tremor_menu_active()&&nav[e.code]){engine._web_key(nav[e.code],down?1:0);e.preventDefault();}}
window.addEventListener('keydown',e=>key(e,true));window.addEventListener('keyup',e=>key(e,false));
function release(){if(engine){for(let i=0;i<512;i++)engine._tremor_input(i,0);for(const k of [13,127,173,175,172,174,61,45,48])engine._web_key(k,0);engine._web_mouse(0,0);}held.clear();horror?.map(false);horror?.purge(false);mouseX=0;}
let mouseX=0,frameBuffer,framePointer,framePixels,frames=0,fpsTime=performance.now();
const fps=document.createElement('span');fps.id='fps';document.body.append(fps);
const settings=setupSettings({getEngine:()=>engine,release,onApply(s){if(musicNode){const wanted=s.musicStyle!=='horror';if(wanted!==musicConnected){musicNode.disconnect();if(wanted)musicNode.connect(musicGain);musicConnected=wanted;}}if(masterGain)masterGain.gain.value=s.master/100;updateMusic(s);fps.hidden=!s.fps;resize(s);},onClose(){if(engine)engine.settingsOpen=!!engine.previewing;canvas.focus();}});
function updateMusic(s,updateScore=true){if(!musicGain)return;const mix=musicMix(s.musicStyle,(engine?._tremor_fear?.()||0)/100,0,s.music),t=audio.context.currentTime;musicGain.gain.setTargetAtTime(mix.oplGain,t,.15);musicFilter.frequency.setTargetAtTime(mix.oplCutoff,t,.3);if(updateScore)horror?.music(s);}
function resize(s=settings.state){if(s.scale==='integer'){const n=Math.max(1,Math.floor(Math.min(innerWidth/320,(innerHeight-70)/240)));canvas.style.width=320*n+'px';canvas.style.height=240*n+'px';}else{canvas.style.width='';canvas.style.height='';}}
window.addEventListener('resize',()=>resize());window.addEventListener('blur',release);
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement!==canvas)release();});
canvas.onclick=()=>{if(!settings.opened&&document.querySelector('#intro').hidden){audio.context?.resume();void requestCanvasLock(canvas);}};
document.addEventListener('mousemove',e=>{if(engine&&!settings.opened&&document.pointerLockElement===canvas){mouseX+=e.movementX;if(settings.state.freelook)engine._tremor_look(Math.round(e.movementY*(settings.state.invertY?1:-1)*settings.state.sensitivity));}});
// Accumulate all events, smooth at a stable presentation cadence, retain fractional motion.
function motion(){if(engine&&!settings.opened&&!historyDialog.open&&!helpDialog.open){const amount=settings.state.smoothing?mouseX*.5:mouseX;const dx=Math.trunc(amount*settings.state.sensitivity*8);if(dx){mouseX-=dx/(settings.state.sensitivity*8);engine._tremor_mouse_turn(dx);engine._tremor_arm_turn(dx);}}requestAnimationFrame(motion);}requestAnimationFrame(motion);
canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('mousedown',e=>{if(engine&&!settings.opened&&document.pointerLockElement===canvas){e.preventDefault();dispatch('Mouse'+e.button,true);held.add('Mouse'+e.button);}});
window.addEventListener('mouseup',e=>{if(engine){dispatch('Mouse'+e.button,false);held.delete('Mouse'+e.button);}});

document.addEventListener('pointerlockerror',()=>release());

// The same bounded episode transcript supplied through the public agent interface.
const historyDialog=document.createElement('dialog'),historyText=document.createElement('pre'),historyClose=document.createElement('button'),historyButton=document.createElement('button');
historyText.style.cssText='white-space:pre-wrap;font:inherit;line-height:1.5';historyClose.textContent='Return to game';historyButton.textContent='Radio log';historyButton.style.cssText='padding:4px 8px;margin:0 8px';historyDialog.append(historyText,historyClose);document.body.append(historyDialog);document.querySelector('#status').append(historyButton,document.createTextNode(' Map: +/- zoom, 0 overview.'));
historyButton.onclick=()=>{if(!engine)return;release();document.exitPointerLock?.();engine.settingsOpen=true;const p=engine._tremor_radio_history();let end=p;while(engine.HEAPU8[end])end++;historyText.textContent=new TextDecoder().decode(engine.HEAPU8.subarray(p,end)).split('\n').map(line=>{const at=line.indexOf('|');return at<0?line:(line.slice(0,at)==='crew-ammo'?'CREW':'HALLORAN')+' \u2014 '+line.slice(at+1);}).join('\n\n');historyDialog.showModal();};
historyClose.onclick=()=>historyDialog.close();historyDialog.addEventListener('close',()=>{engine.settingsOpen=!!engine.previewing||settings.opened;canvas.focus();});

const helpDialog=document.createElement('dialog'),helpButton=document.createElement('button'),helpClose=document.createElement('button');helpButton.textContent='? Help';helpClose.textContent='Return to game';const helpContent=document.querySelector('#how-to-play').cloneNode(true);helpContent.removeAttribute('id');helpDialog.append(helpContent,helpClose);document.body.append(helpDialog);document.querySelector('#status').append(helpButton);
function showHelp(){release();document.exitPointerLock?.();if(engine)engine.settingsOpen=true;helpDialog.showModal();}
helpButton.onclick=showHelp;helpClose.onclick=()=>helpDialog.close();helpDialog.addEventListener('close',()=>{if(engine)engine.settingsOpen=!!engine.uiPaused?.();canvas.focus();});window.addEventListener('keydown',e=>{if(e.key==='?'&&!helpDialog.open){e.preventDefault();showHelp();}});
