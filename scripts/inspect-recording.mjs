// Inspect final encoded video without connecting audio to speakers.
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import puppeteer from 'puppeteer-core';
const file=process.argv[2];if(!file)throw Error('Usage: node scripts/inspect-recording.mjs video.webm');
const bytes=await readFile(file);
const server=createServer((req,res)=>{res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Content-Type','video/webm');res.end(bytes);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await puppeteer.launch({executablePath:process.env.EDGE_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',headless:true,protocolTimeout:120000,args:['--mute-audio','--no-sandbox']});
 const page=await browser.newPage();await page.setViewport({width:1920,height:1080});
 const result=await page.evaluate(async url=>{
  const bytes=await (await fetch(url)).arrayBuffer();
  const audio=await new OfflineAudioContext(2,1,48000).decodeAudioData(bytes.slice(0));
  const sections={};for(const [name,start,end] of [['title',0,10],['demo 1x',10,270],['skip and terminal',270,277],['results',277,audio.duration]]){
   let sum=0,peak=0,count=0;for(let c=0;c<audio.numberOfChannels;c++){const samples=audio.getChannelData(c);for(let i=Math.floor(start*audio.sampleRate);i<Math.min(samples.length,Math.floor(end*audio.sampleRate));i++){const x=samples[i];sum+=x*x;peak=Math.max(peak,Math.abs(x));count++;}}
   sections[name]={rms:Math.sqrt(sum/Math.max(1,count)),peak};if(name!=='title'&&sections[name].rms<1e-6)throw Error('Silent encoded section '+name);
  }
  const v=document.createElement('video');v.muted=true;v.style.cssText='width:1920px;height:1080px';document.body.style.cssText='margin:0;background:black';document.body.append(v);v.src=URL.createObjectURL(new Blob([bytes],{type:'video/webm'}));await new Promise((r,j)=>{v.onloadeddata=r;v.onerror=j;});
  return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,sections};
 },`http://127.0.0.1:${server.address().port}/`);
 for(const [name,time] of [['title',5],['game',120],['end',275],['results',282]]){
  await page.evaluate(async t=>{const v=document.querySelector('video');await new Promise(r=>{v.onseeked=r;v.currentTime=t;});},time);
  await page.screenshot({path:join(tmpdir(),`tremor-gemini-${name}.png`)});
 }
 console.log(JSON.stringify(result,null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));}
