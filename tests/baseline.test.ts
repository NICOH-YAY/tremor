import {test,expect} from 'vitest';
import {baseline} from '../src/agent/baselines';
import {reset,observe,ACTION_IDS} from '../src/player_interface';
const signal=new AbortController().signal;
test('baselines distinguish unread humans and bound short-range combat',async()=>{
 const o=observe(reset(17));o.tic=7;o.weapon='fist';o.objective_bearing=0;
 o.entities=[{type:'unknown figure',bearing_deg:0,distance:48,elevation_deg:0}];
 const aggressive=baseline(),careful=baseline(true);
 expect((await aggressive.decide(o,[...ACTION_IDS],'',signal)).action).toBe('fire');
 expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('read');
 o.entities[0].type='possessed';expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('stun');
 for(let i=0;i<5;i++)expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('purge');
 o.entities[0]={type:'Imp',bearing_deg:0,distance:500,elevation_deg:0};
 expect((await aggressive.decide(o,[...ACTION_IDS],'',signal)).action).toBe('forward');
 o.entities[0].type='corpse';expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('forward');
});

test('navigation uses a closed marker within64 units and leaves an open passage alone',async()=>{
 const o=observe(reset(17));o.entities=[];o.tic=7;o.weapon='fist';o.heading_deg=0;o.map_cell_units=16;o.objective_bearing=0;o.objective_distance='far';
 const rows=Array.from({length:13},()=>Array(13).fill('.'));rows[6][6]='>';rows[6][10]='D';o.automap=rows.map(r=>r.join('')).join('\n');
 expect((await baseline().decide(o,[...ACTION_IDS])).action).toBe('use');
 rows[6][10]='d';o.automap=rows.map(r=>r.join('')).join('\n');
 expect((await baseline().decide(o,[...ACTION_IDS])).action).not.toBe('use');
});

// Normal spawn, production module, real controller: no exit fixture or replay.
test('careful baseline completes E1M1 seed17 within the declared step limit',async()=>{
 const {runEpisode}=await import('../src/eval/runner');
 const result=await runEpisode(baseline(true),{seed:17,levelId:'E1M1',maxSteps:1800,tracePath:false});
 expect(result.reason).toBe('exit');expect(result.reachedExit).toBe(true);
 expect(result.steps).toBeLessThanOrEqual(1800);expect(result.illegalActions).toBe(0);
},30000);

test('public route points down the starting corridor rather than through the exit wall',()=>{
 const state=reset(1,'E1M1'),o=observe(state);
 expect(Math.abs(o.objective_bearing)).toBeLessThan(10);
 expect(observe(state)).toEqual(o);
});
