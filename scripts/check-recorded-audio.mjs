// Decode the produced Opus audio without connecting any node to speaker output.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
export async function verifyRecordedAudio(file){
 const bytes=await readFile(file);
 const server=createServer((req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.end(bytes);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await puppeteer.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',timeout:120000,protocolTimeout:120000,headless:true,args:['--no-sandbox','--mute-audio']});
  const page=await browser.newPage();
  return await page.evaluate(async url=>{
   const context=new OfflineAudioContext(2,1,48000);
   const decoded=await context.decodeAudioData(await (await fetch(url)).arrayBuffer());
   let peak=0,sum=0,count=0;for(let c=0;c<decoded.numberOfChannels;c++)for(const x of decoded.getChannelData(c)){peak=Math.max(peak,Math.abs(x));sum+=x*x;count++;}
   const rms=Math.sqrt(sum/count);if(rms<1e-6)throw Error('Encoded audio is silent');
   return {duration:decoded.duration,channels:decoded.numberOfChannels,sampleRate:decoded.sampleRate,peak,rms};
  },`http://127.0.0.1:${server.address().port}/`);
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
}
if(process.argv[1]?.endsWith('check-recorded-audio.mjs'))console.log(JSON.stringify(await verifyRecordedAudio(process.argv[2]),null,2));
