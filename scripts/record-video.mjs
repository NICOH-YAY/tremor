import {fixWebmDuration,readWebmDuration} from './webm-duration.mjs';
import {createServer} from 'node:http';
import {readFile,mkdir,open,writeFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import puppeteer from 'puppeteer-core';
import {verifyRecordedAudio} from './check-recorded-audio.mjs';

// cwd: project root. Use only the installed Edge; puppeteer-core downloads no browser.
const build=spawnSync(process.platform==='win32'?'cmd.exe':'npm',process.platform==='win32'?['/d','/s','/c','npm.cmd run build']:['run','build'],{stdio:'inherit'});if(build.status!==0)throw Error('Build failed');
const root=resolve('dist'),types={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm','.json':'application/json','.mp3':'audio/mpeg','.gz':'application/octet-stream'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(root+sep))throw Error('Invalid path');const bytes=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));await mkdir('recordings',{recursive:true});
const date=new Date().toISOString().slice(0,10),file=`recordings/${process.env.RECORD_DIAGNOSTIC?"diagnostic":"tremor-agent"}-${date}.webm`,output=await open(file,'w');let browser;
try{
 browser=await puppeteer.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',protocolTimeout:600000,headless:process.env.RECORD_HEADED==='1'?false:'new',args:['--mute-audio','--no-sandbox','--autoplay-policy=no-user-gesture-required','--window-size=1920,1080','--window-position=-2400,0','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});
 const page=await browser.newPage();await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});
 page.on('console',m=>console.log('Browser:',m.text()));
 page.on('pageerror',e=>{console.error('Page:',e.stack);void page.evaluate(message=>{globalThis.recordError=message;},e.message);});
 await page.exposeFunction('writeRecordingChunk',async bytes=>{await output.write(Buffer.from(bytes));});
 await page.goto(`http://127.0.0.1:${server.address().port}/watch.html?record=1&script=default${process.env.RECORD_DIAGNOSTIC?"&diagnostic=1":""}`,{waitUntil:'networkidle0'});
 console.log('Recording in real time with installed Edge ('+(process.env.RECORD_HEADED==='1'?'headed offscreen':'headless=new')+')');
 await page.waitForFunction(()=>globalThis.recordDone||globalThis.recordError,{timeout:360000,polling:1000});
 const result=await page.evaluate(()=>({done:globalThis.recordDone,error:globalThis.recordError}));if(result.error)throw Error(result.error);
 await output.close();const bytes=fixWebmDuration(await readFile(file),result.done.duration);await writeFile(file,bytes);const headerDuration=readWebmDuration(await readFile(file));const sha256=createHash('sha256').update(bytes).digest('hex');
 // Opus codec ID in the Matroska track header, plus nonzero measured master audio.
 const audioTrack=bytes.includes(Buffer.from('A_OPUS'));if(!Object.values(result.done.audioLevels).some(x=>x.rms>1e-6))throw Error('Captured bus silent for entire video');
 if(!audioTrack||result.done.audio.audioPeak===0||result.done.audio.oplPeak===0||!result.done.audio.sfx||!result.done.audio.radio)throw Error('Missing audio layer or Opus track');
 await browser.close();browser=null;
 const encodedAudio=await verifyRecordedAudio(file);if(Math.abs(encodedAudio.duration-headerDuration)>1)throw Error('Header and decoded duration differ by over one second');
 const info={headerDuration,encodedAudio,file,size:bytes.length,sha256,audioTrack,mode:process.env.RECORD_HEADED==='1'?'headed offscreen':'headless=new',...result.done};await writeFile(file+'.json',JSON.stringify(info,null,2)+'\n');
 await writeFile('recordings/README.md',`# Automated Tremor recording\n\nProduced with installed Microsoft Edge (${info.mode}), puppeteer-core, a 1920x1080 canvas at requested 30 fps, VP9/Opus MediaRecorder at 7.5 Mbps video / 192 kbps audio. No human game input or new model calls.\n\nRun from the project root (D:\\Coding VS\\tremor locally; midterms/nicoh-yay in the course checkout):\n\n\`\`\`sh\n# cwd: project root\nnpm run demo:copy\nnpm run record:video\n\`\`\`\n\nThe command builds dist and serves gzip as raw bytes. EDGE_PATH overrides the installed Edge path; RECORD_HEADED=1 selects an offscreen headed window.\n\nContent: 15 s title/rules; 20 s agent interface; 120 s LIVE model-history demo replay at 1x; 2 s labelled skipping-ahead cut executing all remaining actions; 10 s verified timeout ending (five-minute episode cap, no exit); 45 s clean-run baseline_careful success segment at 2x (holds verified exit afterward); 25 s results computed from the committed 2026-10-31 JSON (revision 8f0e4a9); 10 s limitations. Both replays require the watch page's verified badge. For limit endings the recorded reason is applied; state metrics are independently reproduced. Demo has 293 calls and 289 actions; it is excluded from suite results.\n\nOutput: ${file.split('/').pop()} (gitignored). Duration: ${info.duration.toFixed(3)} s; EBML Info Duration read back from the final file: ${info.headerDuration.toFixed(3)} s. Duration is patched in pure JS after capture. Cues are not added; seeking depends on player cluster scanning. Size: ${info.size} bytes. SHA-256: \`${sha256}\`.\n\nAudio: Opus track present; independent offline decode RMS ${info.encodedAudio.rms.toFixed(6)}, peak ${info.encodedAudio.peak.toFixed(6)}; all sources share the captured master: Freedoom OPL music in Layered mode, the existing horror score, engine DMX SFX and decoded Halloran radio. Measured master peak ${info.audio.audioPeak}; OPL peak ${info.audio.oplPeak}; SFX starts ${info.audio.sfx}; radio clips ${info.audio.radio}.\n\nSpeaker output was disabled by routing the master only through the analyser to MediaStreamAudioDestinationNode, with Edge --mute-audio as a second safeguard. Nonzero captured levels with that flag verify that it preserves stream capture.\n\nPer-section captured bus levels:\n\n${Object.entries(info.audioLevels).map(([name,v])=>`- ${name}: peak ${v.peak.toFixed(6)}, RMS ${v.rms.toFixed(6)}`).join('\n')}\n\nFrame delivery: ${info.frames} animation frames, ${info.longFrames} gaps over 50 ms; largest gap ${info.maxGapMs.toFixed(1)} ms. Requested capture is 30 fps; these timing measurements report renderer stalls, not a guarantee of every encoded frame. Recording runs in real time.\n\nUpload the webm to a CourseWorks-viewable location and add its link to the submission. Human playtests remain separate.\n`);
 console.log(JSON.stringify(info,null,2));
}finally{await output.close().catch(()=>{});await browser?.close();await new Promise(r=>server.close(r));}

