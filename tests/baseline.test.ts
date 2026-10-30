import {test,expect} from 'vitest';
import {baseline} from '../src/agent/baselines';
import {reset,observe,ACTION_IDS} from '../src/player_interface';
const signal=new AbortController().signal;
test('baselines use public observations to shoot/read, stun/purge, and select fists',async()=>{
 const o=observe(reset(17));o.entities=[{type:'unknown figure',bearing_deg:0,distance:48}];
 const aggressive=baseline(),careful=baseline(true);
 expect((await aggressive.decide(o,[...ACTION_IDS],'',signal)).action).toBe('fire');
 expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('read');
 o.entities[0].type='possessed';expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('stun');
 for(let i=0;i<5;i++)expect((await careful.decide(o,[...ACTION_IDS],'',signal)).action).toBe('purge');
 o.rounds=0;o.purge=0;expect((await aggressive.decide(o,[...ACTION_IDS],'',signal)).action).toBe('weapon_fist');
 o.weapon='fist';expect((await aggressive.decide(o,[...ACTION_IDS],'',signal)).action).toBe('fire');
 o.entities=[];expect(ACTION_IDS).toContain((await careful.decide(o,[...ACTION_IDS],'',signal)).action);
});
