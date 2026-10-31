const {default:createDoom}=await import(process.argv.includes('--previous')?'./previous-engine.js':process.argv.includes('--reference')?'./reference-engine.js':'../../public/engine/doom.js');
import {readFileSync,writeFileSync} from 'node:fs';
let armed=false,capture=false;
const m=await createDoom({noInitialRun:true,print(){},printErr:console.error,onFrame(ptr){
 if(!armed&&m._tremor_tic()>=1){armed=true;m.settingsOpen=true;setTimeout(()=>{capture=true;m._tremor_preview(0);},0);return;}if(!capture)return;capture=false;
 const p=m.HEAPU8.subarray(ptr,ptr+320*200*4);let sum=0;
 // Engine pixels are BGRA; measure the 3D viewport, excluding the status bar.
 for(let i=0;i<320*168*4;i+=4)sum+=.0722*p[i]+.7152*p[i+1]+.2126*p[i+2];
 const result={meanLuminance:sum/(320*168),tic:m._tremor_tic()};
 const rgb=Buffer.alloc(320*168*3);for(let i=0;i<320*168;i++){rgb[i*3]=p[i*4+2];rgb[i*3+1]=p[i*4+1];rgb[i*3+2]=p[i*4];}
 if(process.argv.includes('--frame'))writeFileSync((process.argv[2]||'engine/build/lighting-result.json').replace('.json','.ppm'),Buffer.concat([Buffer.from('P6\n320 168\n255\n'),rgb]));
 writeFileSync(process.argv[2]||'engine/build/lighting-result.json',JSON.stringify(result,null,2));console.log(result);process.exit(0);
}});
m.FS.writeFile('/game.wad',readFileSync('public/wad/freedoom1.wad'));m.FS.writeFile('/tremor.wad',readFileSync('public/wad/tremor.wad'));
m.callMain(['-iwad','/game.wad','-file','/tremor.wad','-warp','1','1','-nomusic']);
setTimeout(()=>process.exit(1),10000);

