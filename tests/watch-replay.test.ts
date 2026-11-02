import {test,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import createWatch from '../public/engine-watch/doom.js';
import {reset,step,terminate,outcome,ACTION_IDS} from '../src/player_interface';

const manifest=JSON.parse(readFileSync('public/replays/manifest.json','utf8'));
for(const sample of manifest)test(`committed replay is deterministic in headless AND browser spectator: ${sample.player}`,async()=>{
 const bytes=readFileSync(`public/replays/${sample.file}`);
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(sample.sha256);
 expect(bytes.equals(readFileSync(`eval/traces-sample/${sample.file}`))).toBe(true);
 const rows=gunzipSync(bytes).toString().trim().split('\n').map(line=>JSON.parse(line));
 const state=reset(sample.seed,sample.level);
 const m=await createWatch({noInitialRun:true,print(){},printErr(){}});
 for(const name of ['freedoom1','tremor'])m.FS.writeFile(`/${name}.wad`,readFileSync(`public/wad/${name}.wad`));
 m._tremor_agent_reset(sample.seed,1,Number(sample.level.slice(3)),sample.skill);
 m._tremor_watch_frame();
 for(const row of rows){
  // Failed calls do not advance the engine; invalid submitted actions idle.
  if(row.source==='error')continue;
  step(state,'player',row.action);
  const id=ACTION_IDS.indexOf(row.action);
  m._tremor_agent_step(id<0?13:id);
  m._tremor_watch_frame();
 }
 const codes:Record<string,number>={step_limit:3,call_limit:4,timeout:5};
 if(codes[sample.terminal.reason]){terminate(state,sample.terminal.reason);m._tremor_agent_terminate(codes[sample.terminal.reason]);}
 const browser=JSON.parse(m.UTF8ToString(m._tremor_agent_outcome())),headless=outcome(state);
 const report=JSON.parse(readFileSync(sample.report,'utf8'));
 const terminal=report.results.find((r:any)=>r.player===sample.player&&r.seed===sample.seed&&r.levelId===sample.level);
 expect(sample.terminal).toEqual({status:terminal.status,reason:terminal.reason,score:terminal.score,metrics:terminal.metrics});
 expect(browser).toEqual(sample.terminal);
 expect({status:headless.status,reason:headless.reason,score:headless.score,metrics:headless.metrics}).toEqual(sample.terminal);
},60000);
