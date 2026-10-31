import createDoom from '../../public/engine/doom.js';
import {readFileSync,writeFileSync} from 'node:fs';
const cpu=[];const frames=[];let nonzero=false,lastTic=-1,betweenTics=0;const start=performance.now();
const module=await createDoom({onFrame(ptr){const tic=module._tremor_tic();if(tic>35){frames.push(performance.now());if(tic===lastTic)betweenTics++;lastTic=tic;if(module._tremor_render_ms)cpu.push(module._tremor_render_ms());}if(module.HEAPU8.subarray(ptr,ptr+320*200*4).some(x=>x!==0))nonzero=true;},print:()=>{},printErr:console.error});
module.FS.writeFile('/game.wad',readFileSync('public/wad/freedoom1.wad'));
module.FS.writeFile('/tremor.wad',readFileSync('public/wad/tremor.wad'));
module.callMain(['-iwad','/game.wad','-file','/tremor.wad','-nomusic','-warp','1','1']);
setTimeout(()=>{const gaps=frames.slice(1).map((t,i)=>t-frames[i]).sort((a,b)=>a-b);cpu.sort((a,b)=>a-b);const result={scope:'stationary E1M1, after tic35; excludes Canvas/audio/layout',rendererMeanMs:cpu.reduce((a,b)=>a+b,0)/cpu.length,rendererP95Ms:cpu[Math.floor(cpu.length*.95)],frames:frames.length,framesBetweenTics:betweenTics,nonzero,elapsedMs:performance.now()-start,meanIntervalMs:gaps.reduce((a,b)=>a+b,0)/gaps.length,p95IntervalMs:gaps[Math.floor(gaps.length*.95)]};console.log(JSON.stringify(result));writeFileSync('engine/build/smoke-result.json',JSON.stringify(result,null,2));process.exit(frames.length>50&&betweenTics>20&&nonzero?0:1);},10000);
