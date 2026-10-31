import {readFileSync} from 'node:fs';
import createDoom from '../../public/engine-headless/doom-test.cjs';
const m=await createDoom({noInitialRun:true,print:console.log,printErr:console.error});
for(const name of ['freedoom1','tremor'])m.FS.writeFile('/'+name+'.wad',readFileSync('public/wad/'+name+'.wad'));
m._tremor_agent_reset(17,1,1,2);
process.exitCode=m._tremor_test()?1:0;
