import { describe,it,expect } from 'vitest';
import { createWorld,idleCmd,tick } from '../src/sim/world';
import { testRoom } from '../src/levels/test_room';
import * as api from '../src/legacy_player_interface';
describe('simulation',()=>{
 it('replays identically with the same seed and commands',()=>{const a=createWorld(testRoom,42),b=createWorld(testRoom,42);for(let i=0;i<120;i++){const c={...idleCmd(),forward:i<20?1:0,turn:0.02,fire:i%9===0};tick(a,c);tick(b,c);}expect(a).toEqual(b);});
 it('moves with momentum and cannot cross walls',()=>{const w=createWorld(testRoom,1);w.entities=[];w.player.angle=Math.PI;for(let i=0;i<100;i++)tick(w,{...idleCmd(),forward:1});expect(w.player.pos.x).toBeGreaterThanOrEqual(1.22);expect(w.player.pos.x).toBeLessThan(2);const velocity=Math.abs(w.player.vel.x);tick(w,idleCmd());expect(Math.abs(w.player.vel.x)).toBeLessThan(velocity);});
 it('requires a key and opens a traversable door',()=>{const w=createWorld(testRoom,1);w.entities=[];w.player.pos={x:4.5,y:4.5};tick(w,{...idleCmd(),use:true});expect(w.map.doors[0].state).toBe('closed');for(let i=0;i<20;i++)tick(w,{...idleCmd(),forward:1});expect(w.player.pos.x).toBeLessThan(5);w.player.keys.push('red');tick(w,{...idleCmd(),use:true});for(let i=0;i<20;i++)tick(w,{...idleCmd(),forward:1});expect(w.map.doors[0].openAmount).toBe(1);expect(w.player.pos.x).toBeGreaterThan(5.5);});
 it('hits and kills a visible target but does not shoot through walls',()=>{const w=createWorld(testRoom,2);w.entities=w.entities.slice(0,1);w.entities[0].pos={x:4,y:4.5};tick(w,{...idleCmd(),fire:true});expect(w.entities[0].state).toBe('dead');expect(w.events.some(e=>e.type==='kill')).toBe(true);expect(w.player.kills.crew).toBe(1);const b=createWorld(testRoom,2);b.entities=b.entities.slice(0,1);b.entities[0].pos={x:7,y:4.5};tick(b,{...idleCmd(),fire:true});expect(b.entities[0].health).toBe(40);});
});
describe('course interface',()=>{
 it('exports all five operations and advances seven tics',()=>{for(const name of ['reset','observe','legal_actions','step','outcome'] as const)expect(typeof api[name]).toBe('function');const w=api.reset(7);for(const id of api.legal_actions(w)){expect(api.ACTION_IDS).toContain(id);const fresh=api.reset(7);expect(api.step(fresh,id).state.tic).toBe(7);}expect(api.outcome(w).done).toBe(false);const observation=api.observe(w);observation.keys.push('red');expect(w.player.keys).toEqual([]);expect(observation.summary).toContain('Health');});
});
