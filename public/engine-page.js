
const canvas=document.querySelector('canvas'), ctx=canvas.getContext('2d',{alpha:false});
const image=ctx.createImageData(320,200);let engine,starting=false;
const audio={context:null,channels:new Map(),buffers:new Map(),
 params(c,v,s){const ch=this.channels.get(c);if(ch){ch.gain.gain.value=v/127;ch.pan.pan.value=(s-127)/127;}},
 stop(c){const ch=this.channels.get(c);if(ch){ch.source.stop();this.channels.delete(c);}},
 playing(c){return this.channels.has(c);},
 play(c,bytes,rate,v,s){if(!this.context)return;this.stop(c);const buffer=this.context.createBuffer(1,bytes.length,rate);const pcm=buffer.getChannelData(0);for(let i=0;i<bytes.length;i++)pcm[i]=(bytes[i]-128)/128;const source=this.context.createBufferSource(),gain=this.context.createGain(),pan=this.context.createStereoPanner();source.buffer=buffer;source.connect(gain).connect(pan).connect(this.context.destination);const ch={source,gain,pan};this.channels.set(c,ch);this.params(c,v,s);source.onended=()=>{if(this.channels.get(c)===ch)this.channels.delete(c);};source.start();}
};
async function start(file){if(starting)return;starting=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);
 try{audio.context=new AudioContext();await audio.context.resume();const bytes=file?new Uint8Array(await file.arrayBuffer()):new Uint8Array(await (await fetch(new URL('./wad/freedoom1.wad',import.meta.url))).arrayBuffer());
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const magic=new TextDecoder().decode(bytes.subarray(0,4));if(bytes.length<12||magic!=='IWAD')throw Error('Select a supported Doom IWAD.');const count=view.getInt32(4,true),offset=view.getInt32(8,true);if(count<0||offset<12||offset+count*16>bytes.length)throw Error('Invalid WAD directory.');
 const {default:createDoom}=await import(/* @vite-ignore */ new URL('./engine/doom.js',import.meta.url).href);
 engine=await createDoom({audio,onFrame(bytes){for(let i=0;i<bytes.length;i+=4){image.data[i]=bytes[i+2];image.data[i+1]=bytes[i+1];image.data[i+2]=bytes[i];image.data[i+3]=255;}ctx.putImageData(image,0,0);},printErr:console.error});
 engine.FS.writeFile('/game.wad',bytes);document.querySelector('#title').style.display='none';document.querySelector('#game').style.display='block';canvas.focus();engine.callMain(['-iwad','/game.wad','-nomusic']);
 }catch(e){document.querySelector('#error').textContent=String(e);starting=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
document.querySelector('#play').onclick=()=>start();document.querySelector('#load').onclick=()=>document.querySelector('#wad').click();document.querySelector('#wad').onchange=e=>{if(e.target.files[0])start(e.target.files[0]);};
const mapping={ArrowUp:173,ArrowDown:175,ArrowLeft:172,ArrowRight:174,KeyW:173,KeyS:175,KeyA:160,KeyD:161,ControlLeft:163,ControlRight:163,Space:162,KeyE:162,ShiftLeft:182,ShiftRight:182,Escape:27,Enter:13,Tab:9,Backspace:127,Minus:45,Equal:61};for(let i=1;i<=7;i++)mapping['Digit'+i]=48+i;
const held=new Set();function key(e,down){if(!engine)return;const k=mapping[e.code];if(k===undefined)return;e.preventDefault();if(down){if(held.has(e.code))return;held.add(e.code);}else held.delete(e.code);engine._web_key(k,down?1:0);}
window.addEventListener('keydown',e=>key(e,true));window.addEventListener('keyup',e=>key(e,false));function release(){if(!engine)return;for(const code of held)if(mapping[code]!==undefined)engine._web_key(mapping[code],0);held.clear();engine._web_mouse(0,0);}
window.addEventListener('blur',release);document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement!==canvas)release();});canvas.onclick=()=>canvas.requestPointerLock();document.addEventListener('mousemove',e=>{if(engine&&document.pointerLockElement===canvas)engine._web_mouse(held.has('Mouse')?1:0,Math.round(e.movementX*2));});canvas.addEventListener('mousedown',e=>{if(engine&&e.button===0&&document.pointerLockElement===canvas){held.add('Mouse');engine._web_mouse(1,0);}});window.addEventListener('mouseup',()=>{held.delete('Mouse');if(engine)engine._web_mouse(0,0);});
