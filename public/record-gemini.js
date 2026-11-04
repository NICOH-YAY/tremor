import {setupAudio} from './record-audio.js';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function record(replay){
 const params=new URLSearchParams(location.search),diagnostic=params.get('diagnostic')==='1';
 const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;canvas.id='recording';canvas.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:100;background:#080c11';document.body.append(canvas);
 const g=canvas.getContext('2d',{alpha:false});g.imageSmoothingEnabled=false;
 const audio=await setupAudio(replay.canvas);globalThis.watchAudio=audio;
 const manifest=await (await fetch('./replays/manifest.json')).json(),results=await (await fetch('./replays/results.json')).json();
 let heading='Tremor',table=null,card=[],label='',game=false,frames=0,longFrames=0,maxGap=0,previous=0,stopped=false;
 function text(s,x,y,width,size=30,color='#e8e4db'){g.font=`${size}px system-ui`;g.fillStyle=color;let line='',yy=y;for(const word of String(s).split(/\s+/)){if(g.measureText(line+' '+word).width>width&&line){g.fillText(line,x,yy);yy+=size*1.4;line='';}line+=(line?' ':'')+word;}g.fillText(line,x,yy);return yy+size*1.5;}
 function draw(now){if(stopped)return;frames++;if(previous){const gap=now-previous;maxGap=Math.max(maxGap,gap);if(gap>50)longFrames++;}previous=now;audio.frame();g.fillStyle='#080c11';g.fillRect(0,0,1920,1080);text('TREMOR / AGENT OBSERVATORY',65,65,1700,28,'#d4aa87');
 if(game){text(label,65,120,1770,34,'#f1c29a');g.filter='brightness(135%) contrast(108%)';g.drawImage(replay.canvas,65,155,1280,800);g.filter='none';let y=175;for(const id of ['identity','location','badge','counts','clock','hud','action','usage','ending'])y=text(document.getElementById(id).textContent.replace(/ \(recorded call latency[^)]*\)/,'').replace(/ Terminal result,.*/,'').replace(/\$([0-9]+\.[0-9]{2})[0-9]+/,(_,n)=>String.fromCharCode(36)+n),1390,y,460,28);text(document.getElementById('reason').textContent,65,990,1770,22);text('Radio: '+audio.radioText(),1390,900,460,28,'#c4b29e');}
 else if(table){text(heading,100,200,1720,56,'#f1c29a');const xs=[100,570,740,920,1100,1350,1610];const headers=['player','exits','deaths','limits','crew killed','fired unread','est. cost'];[headers,...table].forEach((row,i)=>{const y=310+i*85;g.fillStyle=i%2?'#151f29':'#10171f';g.fillRect(85,y-40,1750,80);row.forEach((v,j)=>text(v,xs[j],y,j===0?450:230,28,i===0?'#f1c29a':'#e8e4db'));});text('Costs at Vertex prices checked 2026-10-31',100,880,1700,32);text('Recorded-usage estimates; lower bounds when usage is unknown. Demo excluded.',100,950,1700,28);}
 else {text(heading,100,220,1700,64,'#f1c29a');let y=330;for(const line of card)y=text(line,100,y,1690,32)+20;}
 requestAnimationFrame(draw);}
 const demo=manifest.findIndex(x=>x.label?.startsWith('demo'));
 if(demo<0)throw Error('Missing Gemini recording');
 await replay.verify(demo);
 const verified=[];
 draw(performance.now());
 const stream=canvas.captureStream(30);for(const track of audio.destination.stream.getAudioTracks())stream.addTrack(track);
 const mimeType='video/webm;codecs=vp9,opus';if(!MediaRecorder.isTypeSupported(mimeType))throw Error('VP9/Opus unavailable');
 const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:7500000,audioBitsPerSecond:192000});let pending=Promise.resolve();recorder.ondataavailable=e=>{if(e.data.size)pending=pending.then(async()=>globalThis.writeRecordingChunk(Array.from(new Uint8Array(await e.data.arrayBuffer()))));};
 const started=performance.now();recorder.start(1000);
 async function slide(title,lines,ms){console.log("Section:",title);audio.section(title);game=false;table=null;heading=title;card=lines;await sleep(diagnostic?1000:ms);}
 await slide('The Gemini player / recorded live decisions',[
 'gemini-3.5-flash-lite on Vertex. Deterministic replay; no human move selection or new model calls.',
 'Sees public text observations: health, inventory, nearby entities, explored automap and radio; history K=8. The video view is for spectators.',
 '40 legal actions, seven tics per step. Limits: 600 actions / calls, 20 s per call, five-minute episode cap.',
 'E1M1, seed 17, model-history; terminal: timeout. A labelled cut keeps this video below five minutes.'
 ],10000);
 for(const [mode,seconds,name] of [[demo,260,'Demo (outside suite)']]){
  const m=manifest[mode];
  const identity=`${name} / ${m.level} / seed ${m.seed} / history / terminal: ${m.terminal.reason}`;
  audio.section(identity+' / 1x');replay.speed(1);await replay.start(mode);game=true;label='Deterministic replay / 1x / '+identity;
  console.log('Section:',label);await sleep(diagnostic?1000:seconds*1000);
  audio.section(identity+' / labelled skip cut');label='SKIP CUT / remaining recorded actions / '+identity;await sleep(2000);await replay.skip();
  if(document.getElementById('badge').textContent!=='Replay verified')throw Error('Gemini replay mismatch');
  verified.push({file:m.file,level:m.level,seed:m.seed,condition:m.player,terminal:m.terminal,badge:document.getElementById('badge').textContent});
  label='Deterministic replay / VERIFIED END / '+identity;await sleep(diagnostic?1000:5000);
 }
 const history=results.results.filter(x=>x.player==='model-history'),obs=results.results.filter(x=>x.player==='model-obs-only');
 if(history.length!==14||obs.length!==14||[...history,...obs].some(x=>x.mocked||!['timeout','dead'].includes(x.reason)))throw Error('Unexpected suite results');
 await slide('Honest results / committed declared suite',[
 `Gemini history: exits ${history.filter(x=>x.reason==='exit').length} of ${history.length}. Observation-only: exits ${obs.filter(x=>x.reason==='exit').length} of ${obs.length}.`,
 `History: ${history.filter(x=>x.reason==='dead').length} deaths, ${history.filter(x=>x.reason==='timeout').length} five-minute timeouts. Observation-only: ${obs.filter(x=>x.reason==='dead').length} deaths, ${obs.filter(x=>x.reason==='timeout').length} five-minute timeouts.`,
 'Shown demo ends by the five-minute cap (timeout); it did not reach the exit.',
 'Demo is separate from the suite. Its committed terminal metrics are reproduced; all recorded actions execute unchanged.',
 `Source: ${results.date}, revision ${results.revision}. Reasons are verbatim where retained; unavailable reasons are labelled.`
 ],10000);
 const duration=(performance.now()-started)/1000;await new Promise(resolve=>{recorder.onstop=resolve;recorder.stop();});await pending;stopped=true;stream.getTracks().forEach(t=>t.stop());
 globalThis.recordDone={verified,duration,frames,longFrames,maxGapMs:maxGap,audio:audio.stats,audioLevels:audio.levels(),mimeType};
}
