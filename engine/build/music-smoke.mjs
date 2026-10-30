// Real production music playback, title then level; no browser or speakers required.
import createDoom from '../../public/engine/doom.js';
import {readFileSync} from 'node:fs';
const m=await createDoom({onFrame(){},print(){},printErr:console.error});
let wad=readFileSync('public/wad/freedoom1.wad');
if(process.argv.includes('--mus')){
 const score=Buffer.from([0x40,0,0,0x90,188,100,129,12,0x80,60,70,0x60]);
 const mus=Buffer.alloc(16+score.length);mus.write('MUS\x1a');mus.writeUInt16LE(score.length,4);mus.writeUInt16LE(16,6);mus.writeUInt16LE(1,8);score.copy(mus,16);
 const n=wad.readUInt32LE(4),dir=wad.readUInt32LE(8),offset=wad.length;wad=Buffer.concat([wad,mus]);
 for(let i=0;i<n;i++){const p=dir+i*16,name=wad.subarray(p+8,p+16).toString().replaceAll('\0','');if(['D_INTRO','D_INTROA','D_E1M1'].includes(name)){wad.writeUInt32LE(offset,p);wad.writeUInt32LE(mus.length,p+4);}}
}
m.FS.writeFile('/game.wad',wad);
m.FS.writeFile('/tremor.wad',readFileSync('public/wad/tremor.wad'));
m.callMain(['-iwad','/game.wad','-file','/tremor.wad']);
let energy=0,blocks=0,title=false,level=false,serial=0;
const timer=setInterval(()=>{
 const p=m._tremor_music_render(2048)>>1;for(let i=0;i<4096;i++)energy+=Math.abs(m.HEAP16[p+i]);blocks++;
 if(blocks===35){serial=m._tremor_music_song_serial();title=energy>0;console.log('Title OPL:',title,'energy:',energy);energy=0;m._web_key(27,1);m._web_key(27,0);m._web_key(13,1);m._web_key(13,0);}
 if(blocks===50){m._web_key(13,1);m._web_key(13,0);}
 if(blocks===65){m._web_key(13,1);m._web_key(13,0);energy=0;}
 if(blocks===110){level=energy>0&&!!m._tremor_music_active()&&m._tremor_music_song_serial()>serial;console.log('Level OPL:',level,'energy:',energy);clearInterval(timer);process.exit(title&&level?0:1);}
},2048/44100*1000);
setTimeout(()=>process.exit(1),15000);
