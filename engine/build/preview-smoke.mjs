import createDoom from '../../public/engine/doom.js';
import {readFileSync} from 'node:fs';
let frames=0,started=false;const timeout=setTimeout(()=>process.exit(1),10000);
const m=await createDoom({noInitialRun:true,print(){},printErr:console.error,onFrame(){if(++frames>3&&!started){started=true;m.settingsOpen=true;setTimeout(()=>{const before=m._tremor_tic();m._tremor_preview(250);m._tremor_preview(750);setTimeout(()=>{const after=m._tremor_tic();m._tremor_preview(-1);m.settingsOpen=false;console.log(JSON.stringify({before,after,paused:before===after}));clearTimeout(timeout);process.exit(before===after?0:1);},150);},50);}}});
m.FS.writeFile('/game.wad',readFileSync('public/wad/freedoom1.wad'));m.FS.writeFile('/tremor.wad',readFileSync('public/wad/tremor.wad'));m.callMain(['-iwad','/game.wad','-file','/tremor.wad','-warp','1','1']);
