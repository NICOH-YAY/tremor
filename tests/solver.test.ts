import {test,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {baseline_solver,searchRoute} from '../src/agent/solver';
import {ACTION_IDS,observe,reset} from '../src/player_interface';
import {runEpisode} from '../src/eval/runner';

test('BFS follows mapped detour rather than the direct blocked bearing',()=>{
 const o=observe(reset(17));o.automap='#######\n#.....#\n#>##..#\n#.....#\n#######';
 o.heading_deg=0;o.objective_bearing=0;o.map_cell_units=16;
 expect(Math.abs(searchRoute(o))).toBe(90);
});

test('solver reads unread figures, fires only at confirmed hostiles and retreats at low health',async()=>{
 const o=observe(reset(17)),bot=baseline_solver();o.weapon='pistol';
 o.entities=[{type:'unknown figure',bearing_deg:0,distance:48,elevation_deg:0}];
 expect((await bot.decide(o,ACTION_IDS)).action).toBe('read');
 o.entities[0].type='Imp';expect((await bot.decide(o,ACTION_IDS)).action).toBe('fire');
 o.health=20;expect((await bot.decide(o,ACTION_IDS)).action).toBe('back');
});

test('solver accesses only public Observation fields and emits supplied legal IDs',async()=>{
 const publicObservation=observe(reset(17));
 const o=new Proxy(publicObservation,{get(target,key,receiver){
  if(typeof key==='string'&&!Object.hasOwn(target,key))throw Error(`Private field: ${key}`);
  return Reflect.get(target,key,receiver);
 }});
 const bot=baseline_solver();
 expect(ACTION_IDS).toContain((await bot.decide(o,ACTION_IDS)).action);
 expect((await bot.decide(o,['wait'],'unknown action')).action).toBe('wait');
 const source=readFileSync(new URL('../src/agent/solver.ts',import.meta.url),'utf8');
 // The sole interface import is erased at runtime; controller cannot import reset/outcome.
 expect(source.match(/^import .*player_interface.*$/gm)).toEqual(["import type {Observation} from '../player_interface';"]);
 expect(source).not.toMatch(/readFile|WASM|\.wasm|\.wad|outcome\(/);
});

test('fixed shipped map and seed give identical legal traces and an explicit terminal within limits',async()=>{
 const run=()=>runEpisode(baseline_solver(),{seed:17,levelId:'E1M1',tracePath:false});
 const a=await run(),b=await run();
 expect(a.trace.map(r=>r.action)).toEqual(b.trace.map(r=>r.action));
 expect(a.reason).toBe(b.reason);expect(['exit','dead','step_limit','call_limit','timeout']).toContain(a.reason);
 expect(a.done).toBe(true);expect(a.steps).toBeLessThanOrEqual(600);expect(a.controllerCalls).toBeLessThanOrEqual(600);
 expect(a.illegalActions).toBe(0);expect(a.errors).toBe(0);
 for(const row of a.trace)expect(ACTION_IDS).toContain(row.action);
},30000);
