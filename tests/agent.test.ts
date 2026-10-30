import { describe,it,expect } from 'vitest';
import { reset,observe,step,legal_actions,outcome,ACTION_IDS } from '../src/player_interface';
import { runEpisode } from '../src/eval/runner';
import { replay } from '../src/agent/replay';
import type { Controller } from '../src/agent/types';
describe('agent rubric CI',()=>{
 it('rule invariants: tremor monotonic, ammo nonnegative, health bounded',()=>{const w=reset(17);let previous=0;for(let i=0;i<120;i++){step(w,i%4===0?'fire':'wait');expect(w.player.tremor).toBeGreaterThanOrEqual(previous);previous=w.player.tremor;expect(w.player.ammo).toBeGreaterThanOrEqual(0);expect(w.player.health).toBeGreaterThanOrEqual(0);expect(w.player.health).toBeLessThanOrEqual(100);}});
 it('constant legal vocabulary and invalid use feedback',()=>{const w=reset(1);expect(legal_actions(w)).toEqual([...ACTION_IDS]);expect(step(w,'player','not-an-action')).toMatchObject({valid:false,reason:'unknown action'});expect(step(w,'player','purge').valid).toBe(false);w.done=true;expect(legal_actions(w)).toEqual([...ACTION_IDS]);});
 it('scripted path reaches exit on test_room',()=>{const w=reset(2); // Isolate navigation from enemy behavior, retaining authored keys and door.
 w.entities=[];
 const walk=(x:number,y:number)=>{for(let i=0;i<80&&Math.hypot(w.player.pos.x-x,w.player.pos.y-y)>.32;i++){const dx=x-w.player.pos.x,dy=y-w.player.pos.y;step(w,Math.abs(dx)>Math.abs(dy)?dx>0?'forward':'back':dy>0?'strafe_right':'strafe_left');}};
 walk(3.5,5.5);walk(4.4,4.5);
 for(let i=0;i<4;i++)step(w,'use');
 walk(8.5,4.5); expect(outcome(w)).toMatchObject({status:'terminal',reason:'exit',score:100});});
 it('regression: raw kill events leaked an unread figure kind',()=>{const w=reset(1);w.log=[{type:'kill',id:1,kind:'possessed',wasCrew:true}];w.entities=[w.entities[0]];w.entities[0].pos={x:3.5,y:4.5};const text=JSON.stringify(observe(w));expect(text).toContain('unknown figure');expect(text).not.toContain('possessed');expect(text).not.toContain('wasCrew');expect(text).not.toContain('tremor');});
 it('hidden identities do not change legal ids or unread observation',()=>{const a=reset(1),b=reset(1);a.entities=[a.entities[0]];b.entities=[b.entities[0]];a.entities[0].kind='possessed';b.entities[0].kind='crew';a.entities[0].pos=b.entities[0].pos={x:3.5,y:4.5};expect(observe(a)).toEqual(observe(b));expect(legal_actions(a)).toEqual(legal_actions(b));});
 it('fog hides unseen exit and retains seen cells after turning',()=>{const w=reset(1),first=observe(w);expect(first.automap).not.toContain('E');const before=first.automap.split('').filter(x=>x!=='?').length;w.player.angle=Math.PI;expect(observe(w).automap.split('').filter(x=>x!=='?').length).toBeGreaterThanOrEqual(before);});
 it('enforces step and call limits',async()=>{expect((await runEpisode(replay([]),{seed:1,levelId:'test_room',tracePath:false,maxSteps:2})).reason).toBe('step_limit');const failing:Controller={id:'fake-model',model:true,async decide(){throw Error('failed');}};const r=await runEpisode(failing,{seed:1,levelId:'test_room',tracePath:false,maxCalls:2});expect(r.reason).toBe('call_limit');expect(r.modelCalls).toBe(2);expect(r.modelMoves).toBe(0);});
 it('labels invalid-action fallback separately from model moves',async()=>{const c:Controller={id:'fake-model',model:true,async decide(){return {action:'invalid'};}};const r=await runEpisode(c,{seed:1,levelId:'test_room',tracePath:false,maxSteps:4});expect(r.fallbacks).toBe(1);expect(r.modelMoves).toBe(0);expect(r.trace.at(-1)).toMatchObject({source:'fallback',action:'wait',valid:true});});
 it('timeout terminates a slow call and counts it',async()=>{const c:Controller={id:'slow',model:true,async decide(){return new Promise(()=>{});}};const r=await runEpisode(c,{seed:1,levelId:'test_room',tracePath:false,timeoutMs:5});expect(r.reason).toBe('timeout');expect(r.modelCalls).toBe(1);expect(r.trace[0].source).toBe('error');});
});


