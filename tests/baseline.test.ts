import {test,expect} from 'vitest';
import {baseline} from '../src/agent/baselines';
import {reset,observe,ACTION_IDS} from '../src/player_interface';
const signal=new AbortController().signal;
test('baselines use public observations to shoot/read, stun/purge, and select fists',async()=>{
 const o=observe(reset(17));o.tic=7;o.entities=[{type:'unknown figure',bearing_deg:0,distance:48,elevation_deg:0}];
 const aggressive=baseline(),careful=baseline(true);
 expect((await aggressive.decide(o,[...ACTION_IDS],'',signal)).action).toBe('fire');
 expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('read');
 o.entities[0].type='possessed';expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('stun');
 for(let i=0;i<5;i++)expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('purge');
 o.rounds=0;o.purge=0;o.tic=7;expect((await aggressive.decide(o,[...ACTION_IDS],'',signal)).action).toBe('stun');o.tic=14;expect((await aggressive.decide(o,[...ACTION_IDS],'',signal)).action).toBe('weapon_fist');
 o.weapon='fist';expect((await aggressive.decide(o,[...ACTION_IDS],'',signal)).action).toBe('fire');
 o.entities=[];expect(ACTION_IDS).toContain((await careful.decide(o,[...ACTION_IDS],'',signal)).action);
});

test('navigation uses a closed marker within64 units and leaves an open passage alone',async()=>{
 const o=observe(reset(17));o.entities=[];o.tic=7;o.heading_deg=0;o.map_cell_units=16;o.objective_bearing=0;o.objective_distance='far';
 const rows=Array.from({length:13},()=>Array(13).fill('.'));rows[6][6]='>';rows[6][10]='D';o.automap=rows.map(r=>r.join('')).join('\n');
 expect((await baseline().decide(o,[...ACTION_IDS])).action).toBe('use');
 rows[6][10]='d';o.automap=rows.map(r=>r.join('')).join('\n');
 expect((await baseline().decide(o,[...ACTION_IDS])).action).not.toBe('use');
});
