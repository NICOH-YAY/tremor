import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const build=spawnSync(process.env.EMSDK_PYTHON||'D:\\Python\\python.exe',['engine/build/build.py','--test'],{encoding:'utf8'});
if(build.status!==0){console.error(build.stdout,build.stderr);process.exit(1);}
const {default:createDoom}=await import('./test-engine.js');
let frames=0,ran=false;
const module=await createDoom({onFrame(){frames++;},print:console.log,printErr:console.error});
module.FS.writeFile('/game.wad',readFileSync('public/wad/freedoom1.wad'));
module.FS.writeFile('/tremor.wad',readFileSync('public/wad/tremor.wad'));
module.callMain(['-iwad','/game.wad','-file','/tremor.wad','-nomusic','-warp','1','1']);
// Frames no longer imply simulation progress. Let the initial weapon finish raising.
const timer=setInterval(()=>{if(frames>2&&module._tremor_tic()>=35&&!ran){ran=true;const failures=module._tremor_test();clearInterval(timer);process.exit(failures?1:0);}},20);
setTimeout(()=>{console.error('Engine test timed out');process.exit(1);},20000);
