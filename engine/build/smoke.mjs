import createDoom from '../../public/engine/doom.js';
import {readFileSync,writeFileSync} from 'node:fs';
const frames=[];let nonzero=false;const start=performance.now();
const module=await createDoom({onFrame(bytes){frames.push(performance.now());if(bytes.some(x=>x!==0))nonzero=true;},print:()=>{},printErr:console.error});
module.FS.writeFile('/game.wad',readFileSync('public/wad/freedoom1.wad'));
module.FS.writeFile('/tremor.wad',readFileSync('public/wad/tremor.wad'));
module.callMain(['-iwad','/game.wad','-file','/tremor.wad','-nomusic','-warp','1','1']);
setTimeout(()=>{const gaps=frames.slice(1).map((t,i)=>t-frames[i]).sort((a,b)=>a-b);const result={frames:frames.length,nonzero,elapsedMs:performance.now()-start,meanIntervalMs:gaps.reduce((a,b)=>a+b,0)/gaps.length,p95IntervalMs:gaps[Math.floor(gaps.length*.95)]};console.log(JSON.stringify(result));writeFileSync('engine/build/smoke-result.json',JSON.stringify(result,null,2));process.exit(frames.length>50&&nonzero?0:1);},10000);
