// Real production WASM startup/music smoke. No browser DOM or audio device needed.
import createDoom from '../../public/engine/doom.js';
import {readFileSync} from 'node:fs';
import {createIntroGate} from '../../public/startup.js';
let inits=0,intros=0,frames=0;
const button=new EventTarget(),card={hidden:true},gate=createIntroGate(card,button);
const timer=setTimeout(()=>{console.error('Production engine startup timed out');process.exit(1);},10000);
const m=await createDoom({noInitialRun:true,print(s){if(s.startsWith('Z_Init:'))inits++;},printErr:console.error,
 onIntro(){intros++;const first=gate.wait(),second=gate.wait();setTimeout(()=>button.dispatchEvent(new Event('click')),10);return Promise.all([first,second]);},
 onFrame(){frames++;if(frames===2)m.callMain([]);if(frames===3){
  let peak=0;for(let block=0;block<8;block++){const ptr=m._tremor_music_render(2048)>>1;for(const sample of m.HEAP16.subarray(ptr,ptr+4096))peak=Math.max(peak,Math.abs(sample));}
  const evidence={inits,intros,frames,music:m._tremor_music_active(),peak};console.log(JSON.stringify(evidence));clearTimeout(timer);
  process.exit(inits===1&&intros===1&&card.hidden&&evidence.music===1&&peak>0?0:1);
 }}
});
m.FS.writeFile('/game.wad',readFileSync(new URL('../../public/wad/freedoom1.wad',import.meta.url)));
m.FS.writeFile('/tremor.wad',readFileSync(new URL('../../public/wad/tremor.wad',import.meta.url)));
m.callMain(['-iwad','/game.wad','-file','/tremor.wad','-warp','1','1']);
