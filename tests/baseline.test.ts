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

test('navigation uses a closed marker within 64 units and leaves an open passage alone',async()=>{
 const o=observe(reset(17));o.entities=[];o.tic=7;o.weapon='fist';o.heading_deg=0;o.map_cell_units=16;o.objective_bearing=0;o.objective_distance='far';
 const rows=Array.from({length:13},()=>Array(13).fill('.'));rows[6][6]='>';rows[6][10]='D';o.automap=rows.map(r=>r.join('')).join('\n');
 expect((await baseline().decide(o,[...ACTION_IDS])).action).toBe('use');
 rows[6][10]='d';o.automap=rows.map(r=>r.join('')).join('\n');
 expect((await baseline().decide(o,[...ACTION_IDS])).action).not.toBe('use');
});

// Normal spawn, production module, real controller: no exit fixture or replay.
test.each([17,83])('careful baseline completes E1M1 seed%i within the declared step limit',async(seed)=>{
 const {runEpisode}=await import('../src/eval/runner');
 const result=await runEpisode(baseline(true),{seed,levelId:'E1M1',maxSteps:600,maxCalls:600,tracePath:false});
 expect(result.reason).toBe('exit');expect(result.objectivesReached).toBeGreaterThanOrEqual(1);expect(result.reachedExit).toBe(true);
 expect(result.steps).toBeLessThanOrEqual(600);expect(result.illegalActions).toBe(0);
},30000);

test('public route points down the starting corridor rather than through the exit wall',()=>{
 const state=reset(1,'E1M1'),o=observe(state);
 expect(Math.abs(o.objective_bearing)).toBeLessThan(10);
 expect(observe(state)).toEqual(o);
});

test('a damaged, blocked controller turns back toward remembered safe route cells',async()=>{
 const o=observe(reset(17)),bot=baseline(true);o.weapon='fist';o.entities=[];o.motion='moving';o.heading_deg=0;
 const map=(x:number)=>Array.from({length:40},(_,y)=>Array.from({length:40},(_,i)=>y===20&&i===x?'>':'.').join('')).join('\n');
 for(let x=5;x<21;x++){o.automap=map(x);await bot.decide(o,[...ACTION_IDS]);}
 o.motion='blocked';await bot.decide(o,[...ACTION_IDS]);
 o.health=50;o.entities=Array.from({length:3},()=>({type:'unknown figure',distance:200,bearing_deg:0,elevation_deg:0}));
 expect((await bot.decide(o,[...ACTION_IDS])).action).toMatch(/^turn_(left|right)_large$/);
});

test('scarce rounds close the gap and empty guns switch to fists',async()=>{
 const o=observe(reset(17));o.weapon='fist';o.rounds=5;o.entities=[{type:'Imp',distance:250,bearing_deg:0,elevation_deg:0}];
 expect((await baseline().decide(o,[...ACTION_IDS])).action).toBe('forward');
 o.weapon='shotgun';o.rounds=0;
 expect((await baseline().decide(o,[...ACTION_IDS])).action).toBe('weapon_fist');
});
