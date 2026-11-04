import {setupAudio} from './record-audio.js';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function record(replay){
 if(new URLSearchParams(location.search).get('script')==='gemini')return (await import('./record-gemini.js')).record(replay);
 const params=new URLSearchParams(location.search),diagnostic=params.get('diagnostic')==='1';if((params.get('script')||'default')!=='default')throw Error('Unknown recording script');
 const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;canvas.id='recording';canvas.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:100;background:#080c11';document.body.append(canvas);
 const g=canvas.getContext('2d',{alpha:false});g.imageSmoothingEnabled=false;
 const audio=await setupAudio(replay.canvas);globalThis.watchAudio=audio;
 const manifest=await (await fetch('./replays/manifest.json')).json(),results=await (await fetch('./replays/results.json')).json();
 let heading='Tremor',table=null,card=[],label='',game=false,frames=0,longFrames=0,maxGap=0,previous=0,stopped=false;
 function text(s,x,y,width,size=30,color='#e8e4db'){g.font=`${size}px system-ui`;g.fillStyle=color;let line='',yy=y;for(const word of String(s).split(/\s+/)){if(g.measureText(line+' '+word).width>width&&line){g.fillText(line,x,yy);yy+=size*1.4;line='';}line+=(line?' ':'')+word;}g.fillText(line,x,yy);return yy+size*1.5;}
 function draw(now){if(stopped)return;frames++;if(previous){const gap=now-previous;maxGap=Math.max(maxGap,gap);if(gap>50)longFrames++;}previous=now;audio.frame();g.fillStyle='#080c11';g.fillRect(0,0,1920,1080);text('TREMOR / AGENT OBSERVATORY',65,65,1700,28,'#d4aa87');
 if(game){text(label,65,120,1770,34,'#f1c29a');g.filter='brightness(135%) contrast(108%)';g.drawImage(replay.canvas,65,155,1280,800);g.filter='none';let y=175;for(const id of ['identity','location','badge','counts','clock','hud','action','usage','ending'])y=text(document.getElementById(id).textContent.replace(/ \(recorded call latency[^)]*\)/,'').replace(/ Terminal result,.*/,'').replace(/\$([0-9]+\.[0-9]{2})[0-9]+/,(_,n)=>String.fromCharCode(36)+n),1390,y,460,28);text(document.getElementById('reason').textContent.slice(0,145),65,1000,1260,34);text('Radio: '+audio.radioText(),1390,900,460,28,'#c4b29e');}
 else if(table){text(heading,100,200,1720,56,'#f1c29a');const xs=[100,570,740,920,1100,1350,1610];const headers=['player','exits','deaths','limits','crew killed','fired unread','est. cost'];[headers,...table].forEach((row,i)=>{const y=310+i*85;g.fillStyle=i%2?'#151f29':'#10171f';g.fillRect(85,y-40,1750,80);row.forEach((v,j)=>text(v,xs[j],y,j===0?450:230,28,i===0?'#f1c29a':'#e8e4db'));});text('Costs at Vertex prices checked 2026-10-31',100,880,1700,32);text('Recorded-usage estimates; lower bounds when usage is unknown. Demo excluded.',100,950,1700,28);}
 else {text(heading,100,220,1700,64,'#f1c29a');let y=330;for(const line of card)y=text(line,100,y,1690,32)+20;}
 requestAnimationFrame(draw);}
 const demo=manifest.findIndex(x=>x.label?.startsWith('demo'));
 const careful=manifest.findIndex(x=>x.player==='baseline_careful'&&x.terminal.reason==='exit');
 if(demo<0||careful<0)throw Error('Missing recording replays');
 await replay.verify(demo);await replay.verify(careful);
 draw(performance.now());
 const stream=canvas.captureStream(30);for(const track of audio.destination.stream.getAudioTracks())stream.addTrack(track);
 const mimeType='video/webm;codecs=vp9,opus';if(!MediaRecorder.isTypeSupported(mimeType))throw Error('VP9/Opus unavailable');
 const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:7500000,audioBitsPerSecond:192000});let pending=Promise.resolve();recorder.ondataavailable=e=>{if(e.data.size)pending=pending.then(async()=>globalThis.writeRecordingChunk(Array.from(new Uint8Array(await e.data.arrayBuffer()))));};
 const started=performance.now();recorder.start(1000);
 async function slide(title,lines,ms){console.log("Section:",title);audio.section(title);game=false;table=null;heading=title;card=lines;await sleep(diagnostic?1000:ms);}
 await slide('Tremor',['Doom (id Software, 1993) Episode 1 on Freedoom, real engine','Agent playing. No human input.','READ / STUN / PURGE; corpses raise fear; starting rounds = enemies + 1.'],15000);
 await slide('The agent interface',['7-tic steps; 40 constant actions','600 actions; 600 calls; 20 s call timeout; 5 min episode cap','gemini-3.5-flash-lite on Vertex; history K=8','Recorded LIVE decisions replayed deterministically. No new API calls.'],20000);

 console.log("Section: model demo");audio.section("model demo 1x");replay.speed(1);await replay.start(demo);game=true;label='LIVE model-history demo replay / 1x / no human input';await sleep(diagnostic?1000:120000);
 console.log('Section: skipping ahead');audio.section('skipping ahead and timeout');label='Skipping ahead to the recorded ending';await sleep(2000);await replay.skip();
 if(document.getElementById('badge').textContent!=='Replay verified')throw Error('Demo replay mismatch');
 label='timeout / 5-minute episode cap; the model did not reach the exit';await sleep(diagnostic?1000:10000);

 console.log("Section: baseline");audio.section("baseline careful 2x");replay.speed(2);await replay.start(careful);label='Scripted baseline, 2x / baseline_careful';await sleep(45000);
 if(replay.state().running)throw Error('Baseline did not finish within segment');if(document.getElementById('badge').textContent!=='Replay verified')throw Error('Baseline replay mismatch: '+document.getElementById('badge').textContent+' / '+JSON.stringify(replay.state()));
 const lines=[];for(const player of [...new Set(results.results.map(x=>x.player))]){const rows=results.results.filter(x=>x.player===player),sum=k=>rows.reduce((n,r)=>n+(r[k]||0),0);lines.push([player,`${rows.filter(r=>r.reason==='exit').length}/${rows.length}`,String(rows.filter(r=>r.reason==='dead').length),String(rows.filter(r=>['timeout','step_limit','call_limit'].includes(r.reason)).length),String(sum('crewKilled')),String(sum('firedUnread')),sum('estimatedCost')===0?'$0':`$${sum('estimatedCost').toFixed(2)}`]);}
 const revision=results.revision||results.gitRevision||results.provenance?.revision||'8f0e4a9';
 console.log('Section: results');audio.section('Declared suite');game=false;heading='Declared suite / '+results.date+' / '+String(revision).slice(0,12);table=lines;await sleep(diagnostic?1000:25000);
 await slide('Limits of this evidence',['Scripted baselines only exit E1M1. Each model condition: 0/14 exits.','Small sample; descriptive comparisons, no significance claim.','Human playtests and personal reflections are separate evidence.'],10000);
 const duration=(performance.now()-started)/1000;await new Promise(resolve=>{recorder.onstop=resolve;recorder.stop();});await pending;stopped=true;stream.getTracks().forEach(t=>t.stop());
 globalThis.recordDone={duration,frames,longFrames,maxGapMs:maxGap,audio:audio.stats,audioLevels:audio.levels(),mimeType};
}
