// Original CPU-cheap presentation: cached overlays, bounded Web Audio graph.
export function createHorror(canvas,ac,master,displayCanvas=canvas){
 const ctx=canvas.getContext('2d'),shade=document.createElement('canvas');shade.width=320;shade.height=200;const sc=shade.getContext('2d'),gradient=sc.createRadialGradient(160,100,45,160,100,190);gradient.addColorStop(0,'transparent');gradient.addColorStop(1,'#000');sc.fillStyle=gradient;sc.fillRect(0,0,320,200);
 const grain=document.createElement('canvas');grain.width=64;grain.height=64;const gc=grain.getContext('2d'),gi=gc.createImageData(64,64);for(let i=0;i<gi.data.length;i+=4){const v=Math.random()*255;gi.data[i]=gi.data[i+1]=gi.data[i+2]=v;gi.data[i+3]=18;}gc.putImageData(gi,0,0);gc.fillStyle='rgba(0,0,0,.12)';for(let y=0;y<64;y+=2)gc.fillRect(0,y,64,1);const grainPattern=ctx.createPattern(grain,'repeat');
 const overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:8';
 const objective=document.createElement('div'),subtitle=document.createElement('div'),control=document.createElement('div'),arrow=document.createElement('div');
 objective.style.cssText='position:absolute;left:18px;top:48px;font-size:13px;text-shadow:1px 1px black';
 subtitle.style.cssText='position:fixed;transform:translateX(-50%);padding:8px 14px;background:rgba(0,0,0,.78);border-radius:3px;text-align:center;line-height:1.35;font-size:clamp(12px,1.6vw,19px);max-height:calc(2.7em + 16px);overflow:hidden;opacity:0;transition:opacity .25s';
 control.style.cssText='position:absolute;top:48%;width:100%;text-align:center';arrow.style.cssText='position:absolute;top:22%;width:100%;text-align:center';
 const vignette=document.createElement('div');vignette.style.cssText='position:absolute;inset:0;background:radial-gradient(ellipse,transparent 24%,#000d 95%);opacity:0';
 overlay.append(objective,subtitle,control,arrow);document.body.append(overlay);
 let lines=new Map();fetch(new URL('./radio/lines.json',import.meta.url)).then(r=>r.json()).then(x=>lines=new Map(x.map(l=>[l.id,l.text]))).catch(()=>{});
 let previewing=false,skipPreview=false,firstPreview=true;
 globalThis.addEventListener('keydown',()=>{skipPreview=true;});displayCanvas.addEventListener('mousedown',()=>{skipPreview=true;});
 function preview(engine){if(previewing||!engine._tremor_preview)return;previewing=true;skipPreview=false;engine.previewing=true;engine.settingsOpen=true;const start=performance.now(),duration=firstPreview?3000:1500;firstPreview=false;const tick=now=>{if(skipPreview||now-start>=duration){engine._tremor_preview(-1);engine.previewing=false;engine.settingsOpen=!!engine.uiPaused?.();previewing=false;return;}const t=(now-start)/duration;engine._tremor_preview(Math.round(Math.sin(t*Math.PI)*1000));requestAnimationFrame(tick);};requestAnimationFrame(tick);}
 let lastStory='',lastObjective='',changed=0,subUntil=0,map=false,nextHeart=0,nextNote=0,nextWhisper=0,fear=0;
 const score=ac.createGain();score.gain.value=0;score.connect(master);
 const low=ac.createBiquadFilter();low.type='lowpass';low.frequency.value=250;low.connect(score);
 for(const hz of [31,46.3,62.2,93.1]){const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=hz;o.detune.value=Math.random()*14-7;g.gain.value=.045;o.connect(g).connect(low);o.start();}
 const breathBuffer=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate),bd=breathBuffer.getChannelData(0);for(let i=0;i<bd.length;i++)bd[i]=(Math.random()*2-1)*Math.pow(Math.max(0,Math.sin(i/bd.length*Math.PI*2)),2);const breath=ac.createBufferSource(),breathFilter=ac.createBiquadFilter(),breathGain=ac.createGain();breath.buffer=breathBuffer;breath.loop=true;breathFilter.type='bandpass';breathFilter.frequency.value=480;breathFilter.Q.value=.8;breathGain.gain.value=0;breath.connect(breathFilter).connect(breathGain).connect(master);breath.start();
 const radio=ac.createBiquadFilter(),radioLow=ac.createBiquadFilter(),distortion=ac.createWaveShaper();radio.type='highpass';radio.frequency.value=300;radioLow.type='lowpass';radioLow.frequency.value=3400;const curve=new Float32Array(128);for(let i=0;i<128;i++){const x=i/63.5-1;curve[i]=Math.tanh(x*1.3)/Math.tanh(1.3);}distortion.curve=curve;radio.connect(radioLow).connect(distortion).connect(master);
 function tone(hz,duration,volume,type='sine',destination=master,delay=0){const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+delay;o.type=type;o.frequency.value=hz;g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g).connect(destination);o.start();o.stop(t+duration);o.onended=()=>{o.disconnect();g.disconnect();};}
 function crackle(){const b=ac.createBuffer(1,ac.sampleRate*.2,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*.09*(1-i/d.length);const s=ac.createBufferSource();s.buffer=b;s.connect(radio);s.start();s.onended=()=>s.disconnect();}
 async function speak(id,fallback){const text=lines.get(id)||fallback;subtitle.replaceChildren();const speaker=document.createElement('strong');speaker.style.color='#d9b884';speaker.textContent=id==='crew-ammo'?'CREW — ':'HALLORAN — ';subtitle.append(speaker,document.createTextNode(text));subtitle.style.opacity='1';subUntil=performance.now()+Math.max(6500,text.length*65);if(id==='crew-ammo')return;crackle();try{const r=await fetch(new URL('./radio/'+id+'.mp3',import.meta.url));if(!r.ok)throw Error();const b=await ac.decodeAudioData(await r.arrayBuffer()),s=ac.createBufferSource();s.buffer=b;s.connect(radio);s.start();s.onended=()=>s.disconnect();}catch{if(globalThis.speechSynthesis){const u=new SpeechSynthesisUtterance(text);u.pitch=.65;u.rate=.88;speechSynthesis.speak(u);}}}
 return {intro(){crackle();},map(v){map=v;},frame(engine,s){
  const now=performance.now();fear=(engine._tremor_fear?.()||0)/100;
  ctx.save();if(fear){ctx.globalCompositeOperation='saturation';ctx.globalAlpha=fear*.7;ctx.fillStyle='#808080';ctx.fillRect(0,0,320,200);}ctx.restore();
  if(s.brightness!==100){ctx.save();ctx.globalCompositeOperation=s.brightness>100?'screen':'source-over';ctx.globalAlpha=Math.abs(s.brightness-100)/160;ctx.fillStyle=s.brightness>100?'#fff':'#000';ctx.fillRect(0,0,320,200);ctx.restore();}
  ctx.save();ctx.globalAlpha=fear*.9;ctx.drawImage(shade,0,0);if(s.grain||previewing){ctx.globalAlpha=.3;ctx.fillStyle=grainPattern;ctx.fillRect(0,0,320,200);}ctx.restore();
  breathGain.gain.setTargetAtTime(Math.max(0,fear-.55)*.18,ac.currentTime,.5);breath.playbackRate.value=.8+fear*.65;
  score.gain.setTargetAtTime(s.musicStyle==='horror'?s.music/100*(.3+fear*.45+(engine._tremor_pressure?.()||0)/400)*(fear>.6&&Math.floor(now/1000)%47<4?0:1):0,ac.currentTime,.3);
  if(fear>.15&&now>nextHeart){tone(48,.18,fear*.17);tone(38,.18,fear*.1,'sine',master,.13);nextHeart=now+1100-fear*650;}
  if(fear>.75&&now>nextWhisper){crackle();nextWhisper=now+20000+Math.random()*25000;}
  if(s.musicStyle==='horror'&&now>nextNote){tone([110,116.54,155.56,220][Math.floor(Math.random()*4)],2,.025,'triangle',score);if(Math.random()<.25)tone(390+Math.random()*1000,.7,.012,'square',score);nextNote=now+3500+Math.random()*8000;}
  if(engine._tremor_story){const p=engine._tremor_story();let end=p;while(engine.HEAPU8[end])end++;const [obj,bearing,distance,id,...text]=new TextDecoder().decode(engine.HEAPU8.subarray(p,end)).split('|');
   if(obj!==lastObjective){lastObjective=obj;changed=now;preview(engine);}
   objective.textContent=obj;objective.style.opacity=map||now-changed<5500?'1':'0';arrow.textContent=map?`${Number(bearing)>15?'\u2190':Number(bearing)<-15?'\u2192':'\u2191'} ${distance}`:'';
   if(engine._tremor_radio_pop){const q=engine._tremor_radio_pop();let qe=q;while(engine.HEAPU8[qe])qe++;if(qe>q){const [event,...words]=new TextDecoder().decode(engine.HEAPU8.subarray(q,qe)).split('|');void speak(event,words.join('|'));}}else if(id&&id!==lastStory){lastStory=id;void speak(id,text.join('|'));}
  }
  const rect=displayCanvas.getBoundingClientRect();subtitle.style.left=(rect.left+rect.width/2)+'px';subtitle.style.bottom=(innerHeight-rect.top-rect.height*.80)+'px';subtitle.style.width=Math.min(rect.width*.9,900)+'px';subtitle.style.opacity=now>subUntil?'0':'1';
  control.textContent=document.pointerLockElement===displayCanvas||!document.querySelector('#intro').hidden?'':'Click to take control';
 }};
}
