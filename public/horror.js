import {musicMix} from './music.js';
// Original CPU-cheap presentation: cached overlays, bounded Web Audio graph.
export function createHorror(canvas,ac,master,displayCanvas=canvas,musicBus=master){
 const ctx=canvas.getContext('2d'),shade=document.createElement('canvas');shade.width=320;shade.height=200;const sc=shade.getContext('2d'),gradient=sc.createRadialGradient(160,100,45,160,100,190);gradient.addColorStop(0,'transparent');gradient.addColorStop(1,'#000');sc.fillStyle=gradient;sc.fillRect(0,0,320,200);
 const grain=document.createElement('canvas');grain.width=64;grain.height=64;const gc=grain.getContext('2d'),gi=gc.createImageData(64,64);for(let i=0;i<gi.data.length;i+=4){const v=Math.random()*255;gi.data[i]=gi.data[i+1]=gi.data[i+2]=v;gi.data[i+3]=18;}gc.putImageData(gi,0,0);gc.fillStyle='rgba(0,0,0,.12)';for(let y=0;y<64;y+=2)gc.fillRect(0,y,64,1);const grainPattern=ctx.createPattern(grain,'repeat');
 const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:8';
 const objective=document.createElement('div'),subtitle=document.createElement('div'),control=document.createElement('div'),arrow=document.createElement('div');
 objective.style.cssText='position:absolute;left:18px;top:48px;font-size:13px;text-shadow:1px 1px black';
 subtitle.style.cssText='position:fixed;transform:translateX(-50%);padding:8px 14px;background:rgba(0,0,0,.78);border-radius:3px;text-align:center;line-height:1.35;font-size:clamp(12px,1.6vw,19px);max-height:calc(2.7em + 16px);overflow:hidden;opacity:0;transition:opacity .25s';
 control.style.cssText='position:absolute;right:14px;bottom:80px;font-size:11px';arrow.style.cssText='position:absolute;top:22%;width:100%;text-align:center';
 const vignette=document.createElement('div');vignette.style.cssText='position:absolute;inset:0;background:radial-gradient(ellipse,transparent 24%,#000d 95%);opacity:0';
 overlay.append(objective,subtitle,control,arrow);document.body.append(overlay);
 let lines=new Map();fetch(new URL('./radio/lines.json',import.meta.url)).then(r=>r.json()).then(x=>lines=new Map(x.map(l=>[l.id,l.text]))).catch(()=>{});
 let previewing=false,skipPreview=false,firstPreview=true,usedKeyboard=false;
 globalThis.addEventListener('keydown',()=>{skipPreview=true;usedKeyboard=true;});displayCanvas.addEventListener('mousedown',()=>{skipPreview=true;usedKeyboard=true;});
 function preview(engine){if(previewing||!engine._tremor_preview)return;previewing=true;skipPreview=false;engine.previewing=true;engine.settingsOpen=true;const start=performance.now(),duration=firstPreview?3000:1500;firstPreview=false;const tick=now=>{if(skipPreview||now-start>=duration){engine._tremor_preview(-1);engine.previewing=false;engine.settingsOpen=!!engine.uiPaused?.();previewing=false;return;}const t=(now-start)/duration;engine._tremor_preview(Math.round(Math.sin(t*Math.PI)*1000));requestAnimationFrame(tick);};requestAnimationFrame(tick);}
 const decoder=new TextDecoder(),domCache=new WeakMap();function set(el,key,value){let values=domCache.get(el);if(!values){values={};domCache.set(el,values);}if(values[key]!==value){values[key]=value;if(key==='textContent')el.textContent=value;else el.style[key]=value;}}
 let rect=displayCanvas.getBoundingClientRect();new ResizeObserver(()=>{rect=displayCanvas.getBoundingClientRect();}).observe(displayCanvas);
 let nextStory=0,purging=false,hintUntil=0,hintText='',damageUntil=0,damageSide=0;const seenHints=new Set();try{for(const id of JSON.parse(localStorage.getItem('tremor.hints.v1')||'[]'))seenHints.add(id);}catch{}
 const hint=document.createElement('div');hint.style.cssText='position:absolute;left:18px;bottom:100px';overlay.append(hint);
 let lastStory='',lastObjective='',changed=0,subUntil=0,map=false,nextHeart=0,nextNote=0,nextWhisper=0,fear=0;
 const score=ac.createGain();score.gain.value=0;score.connect(musicBus);
 const low=ac.createBiquadFilter();low.type='lowpass';low.frequency.value=1600;low.Q.value=.5;low.connect(score);
 // About .09 RMS before the .7 slider (~-24 dBFS), before master/compression.
 for(const [hz,type,level] of [[130.81,'sawtooth',.085],[195.99,'triangle',.09],[261.63,'triangle',.055],[55,'sine',.025]]){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=hz;o.detune.value=hz%2? -6:7;g.gain.value=level;o.connect(g).connect(low);o.start();}
 const lfo=ac.createOscillator(),depth=ac.createGain();lfo.frequency.value=.07;depth.gain.value=180;lfo.connect(depth).connect(low.frequency);lfo.start();
 const pulse=ac.createOscillator(),pulseGain=ac.createGain(),pulseLfo=ac.createOscillator(),pulseDepth=ac.createGain(),tensionGain=ac.createGain();pulse.type='triangle';pulse.frequency.value=146.83;pulseGain.gain.value=.055;pulseLfo.frequency.value=1.3;pulseDepth.gain.value=.05;pulseLfo.connect(pulseDepth).connect(pulseGain.gain);pulse.connect(pulseGain).connect(tensionGain).connect(low);tensionGain.gain.value=0;pulse.start();pulseLfo.start();
 // Reusable bell and metallic voices: envelope automation, no per-note buffers/nodes.
 const voices=[[329.63,'triangle'],[783.99,'square']].map(([hz,type])=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=hz;g.gain.value=0;o.connect(g).connect(low);o.start();return {o,g};});
 let dropoutUntil=0,nextDropout=performance.now()+45000;
 // Only frame() samples level pressure; settings can run before the thinker list exists.
 let lastPressure=0;
 function updateMusic(s,pressure=lastPressure){const mix=musicMix(s.musicStyle,fear,pressure,s.music),t=ac.currentTime;score.gain.setTargetAtTime(mix.horrorGain*(fear>.9&&performance.now()<dropoutUntil?.15:1),t,.15);low.frequency.setTargetAtTime(mix.horrorCutoff,t,.5);tensionGain.gain.setTargetAtTime(mix.tension,t,.4);pulseLfo.frequency.setTargetAtTime(1.1+fear*.8,t,.5);}
 const breathBuffer=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate),bd=breathBuffer.getChannelData(0);for(let i=0;i<bd.length;i++)bd[i]=(Math.random()*2-1)*Math.pow(Math.max(0,Math.sin(i/bd.length*Math.PI*2)),2);const breath=ac.createBufferSource(),breathFilter=ac.createBiquadFilter(),breathGain=ac.createGain();breath.buffer=breathBuffer;breath.loop=true;breathFilter.type='bandpass';breathFilter.frequency.value=480;breathFilter.Q.value=.8;breathGain.gain.value=0;breath.connect(breathFilter).connect(breathGain).connect(master);breath.start();
 const radio=ac.createBiquadFilter(),radioLow=ac.createBiquadFilter(),distortion=ac.createWaveShaper();radio.type='highpass';radio.frequency.value=300;radioLow.type='lowpass';radioLow.frequency.value=3400;const curve=new Float32Array(128);for(let i=0;i<128;i++){const x=i/63.5-1;curve[i]=Math.tanh(x*1.3)/Math.tanh(1.3);}distortion.curve=curve;radio.connect(radioLow).connect(distortion).connect(master);
 function tone(hz,duration,volume,type='sine',destination=master,delay=0){const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+delay;o.type=type;o.frequency.value=hz;g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(destination);o.start();o.stop(t+duration);o.onended=()=>{o.disconnect();g.disconnect();};}
 let crackleBuffer;function crackle(prewarm=false){const b=crackleBuffer||ac.createBuffer(1,ac.sampleRate*.2,ac.sampleRate),d=b.getChannelData(0);if(!crackleBuffer){for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*.09*(1-i/d.length);crackleBuffer=b;}if(prewarm)return;const s=ac.createBufferSource();s.buffer=b;s.connect(radio);s.start();s.onended=()=>s.disconnect();}
 async function speak(id,fallback){const text=lines.get(id)||fallback;subtitle.replaceChildren();const speaker=document.createElement('strong');speaker.style.color='#d9b884';speaker.textContent=id==='crew-ammo'?'CREW — ':'HALLORAN — ';subtitle.append(speaker,document.createTextNode(text));subtitle.style.opacity='1';subUntil=performance.now()+Math.max(6500,text.length*65);if(id==='crew-ammo')return;crackle();try{const r=await fetch(new URL('./radio/'+id+'.mp3',import.meta.url));if(!r.ok)throw Error();const b=await ac.decodeAudioData(await r.arrayBuffer()),s=ac.createBufferSource();s.buffer=b;s.connect(radio);s.start();s.onended=()=>s.disconnect();}catch{if(globalThis.speechSynthesis){const u=new SpeechSynthesisUtterance(text);u.pitch=.65;u.rate=.88;speechSynthesis.speak(u);}}}
 crackle(true);
 return {music:updateMusic,hint(id){if(seenHints.has(id))return;seenHints.add(id);try{localStorage.setItem('tremor.hints.v1',JSON.stringify([...seenHints]));}catch{}hintText=['Hold R to read.',"Your hands won't stop shaking.","Don't look at them. Keep moving.",'Out of rounds. Fists. Mercy gives rounds.'][id];hintUntil=performance.now()+6000;},damage(b){damageSide=b;damageUntil=performance.now()+350;},intro(){crackle();},map(v){map=v;nextStory=0;},purge(v){purging=v;},frame(engine,s){
  const now=performance.now();fear=(engine._tremor_fear?.()||0)/100;
  if(now<damageUntil){ctx.fillStyle='rgba(255,20,10,'+((damageUntil-now)/700)+')';if(Math.abs(damageSide)>135)ctx.fillRect(0,182,320,18);else if(Math.abs(damageSide)<45)ctx.fillRect(0,0,320,18);else ctx.fillRect(damageSide>0?0:304,0,16,200);}set(hint,'textContent',now<hintUntil?hintText:'');
  ctx.save();if(fear){ctx.globalCompositeOperation='saturation';ctx.globalAlpha=fear*.7;ctx.fillStyle='#808080';ctx.fillRect(0,0,320,200);}ctx.restore();
  if(s.brightness!==100){ctx.save();ctx.globalCompositeOperation=s.brightness>100?'screen':'source-over';ctx.globalAlpha=Math.abs(s.brightness-100)/160;ctx.fillStyle=s.brightness>100?'#fff':'#000';ctx.fillRect(0,0,320,200);ctx.restore();}
  ctx.save();ctx.globalAlpha=fear*.9;ctx.drawImage(shade,0,0);if(s.grain||previewing){ctx.globalAlpha=.3;ctx.fillStyle=grainPattern;ctx.fillRect(0,0,320,200);}ctx.restore();
  breathGain.gain.setTargetAtTime(Math.max(0,fear-.55)*.18,ac.currentTime,.5);breath.playbackRate.value=.8+fear*.65;
  if(fear>.9&&now>nextDropout){dropoutUntil=now+700+Math.random()*500;nextDropout=now+45000+Math.random()*45000;}
  lastPressure=(engine._tremor_pressure?.()||0)/100;updateMusic(s);
  if(fear>.15&&now>nextHeart){tone(48,.18,fear*.17);tone(38,.18,fear*.1,'sine',master,.13);nextHeart=now+1100-fear*650;}
  if(fear>.75&&now>nextWhisper){crackle();nextWhisper=now+20000+Math.random()*25000;}
  if(s.musicStyle!=='original'&&now>nextNote){const t=ac.currentTime;voices.forEach(({o,g},i)=>{o.frequency.setTargetAtTime(i?620+Math.random()*500:[261.63,293.66,311.13,392][Math.floor(Math.random()*4)],t,.01);g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(i?.065:.18,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+(i?.65:2.5));});nextNote=now+3500+Math.random()*6500;}

  if(engine._tremor_story&&now>=nextStory){nextStory=now+250;const p=engine._tremor_story();let end=p;while(engine.HEAPU8[end])end++;const [obj,bearing,distance,id,...text]=decoder.decode(engine.HEAPU8.subarray(p,end)).split('|');
   if(obj!==lastObjective){lastObjective=obj;changed=now;preview(engine);}
   set(objective,'textContent',obj);set(objective,'opacity',map||now-changed<5500?'1':'0');set(arrow,'textContent',map?`${Number(bearing)>15?'\u2190':Number(bearing)<-15?'\u2192':'\u2191'} ${distance}`:'');
   if(engine._tremor_radio_pop){const q=engine._tremor_radio_pop();let qe=q;while(engine.HEAPU8[qe])qe++;if(qe>q){const [event,...words]=decoder.decode(engine.HEAPU8.subarray(q,qe)).split('|');void speak(event,words.join('|'));}}else if(id&&id!==lastStory){lastStory=id;void speak(id,text.join('|'));}
  }
  set(subtitle,'left',(rect.left+rect.width/2)+'px');set(subtitle,'bottom',(innerHeight-rect.top-rect.height*.80)+'px');set(subtitle,'width',Math.min(rect.width*.9,900)+'px');set(subtitle,'opacity',now>subUntil?'0':'1');
  set(control,'textContent',purging?'Purge charges: '+engine._tremor_charges():usedKeyboard||document.pointerLockElement===displayCanvas||!document.querySelector('#intro').hidden?'':'Click for mouse control');
 }};
}
