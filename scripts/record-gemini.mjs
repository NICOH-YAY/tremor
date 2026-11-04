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

await (await import('./record-gemini-config.mjs')).prepare();
const root=resolve('dist'),types={'.html':'text/html','.js':'text/javascript','.wasm':'application/wasm','.json':'application/json','.mp3':'audio/mpeg','.gz':'application/octet-stream'};

const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(root+sep))throw Error('Invalid path');const bytes=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(bytes);}catch{res.writeHead(404);res.end();}});

await new Promise(r=>server.listen(0,'127.0.0.1',r));await mkdir('recordings',{recursive:true});

const date='2026-11-04',file=`recordings/${process.env.RECORD_DIAGNOSTIC?"diagnostic":"tremor-gemini"}-${date}.webm`,output=await open(file,'w');let browser;

try{

 browser=await puppeteer.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',protocolTimeout:600000,headless:process.env.RECORD_HEADED==='1'?false:'new',args:['--mute-audio','--no-sandbox','--autoplay-policy=no-user-gesture-required','--window-size=1920,1080','--window-position=-2400,0','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']});

 const page=await browser.newPage();await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});

 page.on('console',m=>console.log('Browser:',m.text()));

 page.on('pageerror',e=>{console.error('Page:',e.stack);void page.evaluate(message=>{globalThis.recordError=message;},e.message);});

 await page.exposeFunction('writeRecordingChunk',async bytes=>{await output.write(Buffer.from(bytes));});

 await page.goto(`http://127.0.0.1:${server.address().port}/watch.html?record=1&script=gemini${process.env.RECORD_DIAGNOSTIC?"&diagnostic=1":""}`,{waitUntil:'networkidle0'});

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

 await (await import('./record-gemini-config.mjs')).document(info);

 console.log(JSON.stringify(info,null,2));

}finally{await output.close().catch(()=>{});await browser?.close();await new Promise(r=>server.close(r));}



