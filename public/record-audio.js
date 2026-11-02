import {createOPLStream,musicMix} from './music.js';
import {createHorror} from './horror.js';

export function createRecordedBus(ac){
 const master=ac.createGain(),destination=ac.createMediaStreamDestination(),analyser=ac.createAnalyser();
 master.gain.value=.65;master.connect(analyser);analyser.connect(destination);
 return {master,destination,analyser};
}

// All recording audio sources share this master, including decoded radio files.
export async function setupAudio(canvas){
 const ac=new AudioContext(),{master,destination,analyser}=createRecordedBus(ac);await ac.resume();
 const channels=new Map(),buffers=new Map();let engine,current={terror:0},opl,score,radioText='',lastRadio='';
 const settings={musicStyle:'layered',music:70,brightness:100,grain:false};
 const intro=document.createElement('div');intro.id='intro';intro.hidden=true;document.body.append(intro);
 score=createHorror(canvas,ac,master,canvas,master);
 const lines=await (await fetch('./radio/lines.json')).json();
 async function radio(id){const line=lines.find(x=>x.id===id);if(!line)return;radioText=line.text;const response=await fetch(`./radio/${id}.wav`);if(!response.ok)throw Error('Missing radio '+id);const b=await ac.decodeAudioData(await response.arrayBuffer()),s=ac.createBufferSource(),hi=ac.createBiquadFilter(),lo=ac.createBiquadFilter();hi.type='highpass';hi.frequency.value=300;lo.type='lowpass';lo.frequency.value=3400;s.buffer=b;s.connect(hi).connect(lo).connect(master);s.start();stats.radio++;s.onended=()=>{s.disconnect();hi.disconnect();lo.disconnect();};}
 const stats={sfx:0,radio:0,oplBlocks:0,oplPeak:0,audioPeak:0};
 let section="title";const sections={};const samples=new Float32Array(analyser.fftSize);
 const api={
 params(c,v,s){const ch=channels.get(c);if(ch){ch.gain.gain.value=v/127;ch.pan.pan.value=(s-127)/127;}},
 stop(c){const ch=channels.get(c);if(ch){ch.source.stop();channels.delete(c);}},playing:c=>channels.has(c),
 play(c,bytes,rate,v,s,name){api.stop(c);const key=name+rate+bytes.length;let buffer=buffers.get(key);if(!buffer){buffer=ac.createBuffer(1,bytes.length,rate);const d=buffer.getChannelData(0);for(let i=0;i<bytes.length;i++)d[i]=(bytes[i]-128)/128;buffers.set(key,buffer);}const source=ac.createBufferSource(),gain=ac.createGain(),pan=ac.createStereoPanner();source.buffer=buffer;source.connect(gain).connect(pan).connect(master);const ch={source,gain,pan};channels.set(c,ch);api.params(c,v,s);source.onended=()=>{if(channels.get(c)===ch)channels.delete(c);source.disconnect();gain.disconnect();pan.disconnect();};source.start();stats.sfx++;},
 engine(m){for(const c of [...channels.keys()])api.stop(c);engine=m;m._tremor_music_rate(ac.sampleRate);if(!opl){const stream=createOPLStream(n=>{const ptr=engine._tremor_music_render(n)>>1;return engine.HEAP16.subarray(ptr,ptr+n*2);});opl=ac.createScriptProcessor(2048,0,2);const gain=ac.createGain(),filter=ac.createBiquadFilter();filter.type='lowpass';opl.connect(gain).connect(filter).connect(master);opl.onaudioprocess=e=>{const mix=musicMix('layered',(engine?engine._tremor_fear():0)/100,0,70);gain.gain.value=mix.oplGain;filter.frequency.value=mix.oplCutoff;const l=e.outputBuffer.getChannelData(0),r=e.outputBuffer.getChannelData(1);stream(l,r,mix.pitch);stats.oplBlocks++;for(const x of l)stats.oplPeak=Math.max(stats.oplPeak,Math.abs(x));};}void radio('e1m1').catch(e=>{globalThis.recordError=String(e);});},
 observation(o){current=o;const log=o.radio_log||'';if(log!==lastRadio){lastRadio=log;const found=lines.filter(x=>log.includes(x.text)).at(-1);if(found&&found.id!=='e1m1')void radio(found.id);}},
 frame(){if(engine)score.frame({_tremor_fear:()=>engine._tremor_fear(),_tremor_pressure:()=>engine._tremor_pressure()},settings);analyser.getFloatTimeDomainData(samples);const level=sections[section]??={peak:0,sumSquares:0,samples:0};for(const x of samples){stats.audioPeak=Math.max(stats.audioPeak,Math.abs(x));level.peak=Math.max(level.peak,Math.abs(x));level.sumSquares+=x*x;level.samples++;}},
 section(name){section=name;},levels(){return Object.fromEntries(Object.entries(sections).map(([name,v])=>[name,{peak:v.peak,rms:Math.sqrt(v.sumSquares/Math.max(1,v.samples))}]));},destination,stats,radioText:()=>radioText
 };return api;
}

