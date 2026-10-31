import createDoom from '../../public/engine/doom.js';
import {readFileSync,writeFileSync} from 'node:fs';
import {defaults} from '../../public/settings-store.js';
const settings=defaults();
let done=false;
const m=await createDoom({noInitialRun:true,print(){},printErr:console.error,onFrame(){
 if(done||m._tremor_tic()<100)return;done=true;m._tremor_comfort(settings.sway,settings.autoaim?1:0);m._tremor_set_screen_shake(settings.shake?1:0);m.settingsOpen=true;
 setTimeout(()=>{const result={};for(const fear of [0,100]){m._tremor_debug_terror(fear);result[fear]={cameraSwayUnits:m._tremor_debug_sway(),weaponYUnits:m._tremor_debug_arm_y(),desaturationAlpha:fear/100*.7,vignetteAlpha:fear/100*.9};}writeFileSync('engine/build/fear-result.json',JSON.stringify(result,null,2));console.log(result);process.exit(0);},50);
}});
m.FS.writeFile('/game.wad',readFileSync('public/wad/freedoom1.wad'));m.FS.writeFile('/tremor.wad',readFileSync('public/wad/tremor.wad'));
m.callMain(['-iwad','/game.wad','-file','/tremor.wad','-warp','1','1','-nomusic']);
setTimeout(()=>process.exit(1),10000);
