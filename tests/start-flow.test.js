import {test,expect} from 'vitest';
import {spawnSync} from 'node:child_process';
for(const style of ['layered','horror','original'])test(`real page startup reaches intro and audio callbacks (${style})`,()=>{
 const run=spawnSync(process.execPath,['tests/start-flow-smoke.mjs',style],{encoding:'utf8',timeout:10000});
 expect(run.error?.message,run.stdout+run.stderr).toBeUndefined();
 expect(run.status,run.stdout+run.stderr).toBe(0);
 const evidence=JSON.parse(run.stdout.trim());
 expect(evidence).toMatchObject({callMain:1,intros:1,callbacks:3});
 expect(evidence.frames).toBeGreaterThanOrEqual(3);
 expect(evidence.rafs).toBeGreaterThan(0);
},15000);
