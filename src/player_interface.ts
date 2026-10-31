/** Course interface over the real Doom engine. State is opaque to controllers. */
import {readFileSync} from 'node:fs';
import createDoom from '../public/engine-headless/doom.cjs';
export const STEP_TICS=7;
// This order is the C agent ABI; append only with a matching agent_api.c change.
export const ACTION_IDS=['forward','back','strafe_left','strafe_right','turn_left_small','turn_left_large','turn_right_small','turn_right_large','fire','use','read','stun','purge','wait','weapon_fist','weapon_pistol','weapon_shotgun','turn_left_fine','turn_right_fine','forward_slow','advance_fire','strafe_left_fire','strafe_right_fire','back_fire','sprint','turn_left_small_fire','turn_right_small_fire','turn_left_fine_fire','turn_right_fine_fire','turn_left_small_read','turn_right_small_read','turn_left_fine_read','turn_right_fine_read','advance_read','approach_left_fire','approach_right_fire','turn_left_medium','turn_right_medium','advance_left','advance_right'] as const;
export type ActionId=typeof ACTION_IDS[number];
export type TerminalReason='exit'|'dead'|'step_limit'|'call_limit'|'timeout';
export interface EngineState {readonly seed:number;readonly levelId:string}
interface Module {FS:{writeFile(path:string,data:Uint8Array):void};UTF8ToString(ptr:number):string;_tremor_agent_reset(seed:number,episode:number,map:number,skill:number):void;_tremor_agent_step(action:number):number;_tremor_agent_observe():number;_tremor_agent_outcome():number;_tremor_agent_terminate(reason:number):void}
const modules=new WeakMap<EngineState,Module>();
function moduleOf(state:EngineState){const m=modules.get(state);if(!m)throw Error('Unknown engine state');return m;}
export function reset(seed:number,levelId='E1M1'):EngineState {
 if(!/^E1M[1-9]$/.test(levelId))throw Error(`Unknown level: ${levelId}; expected E1M1 through E1M9`);
 if(!Number.isSafeInteger(seed))throw Error('Seed must be a safe integer');
 let initialized=false;
 const options={noInitialRun:true,wasmBinary:readFileSync(new URL('../public/engine-headless/doom.wasm',import.meta.url)),print(){},printErr:console.error,onRuntimeInitialized(){initialized=true;}};
 // WASM_ASYNC_COMPILATION=0 runs initialization synchronously. Emscripten's
 // factory still returns a resolved promise; the supplied options hold the ABI.
 const ready=createDoom(options);void ready.catch(()=>{});
 if(!initialized)throw Error('Headless artifact must initialize synchronously');
 const m=options as unknown as Module;
 m.FS.writeFile('/freedoom1.wad',readFileSync(new URL('../public/wad/freedoom1.wad',import.meta.url)));
 m.FS.writeFile('/tremor.wad',readFileSync(new URL('../public/wad/tremor.wad',import.meta.url)));
 m._tremor_agent_reset(seed,1,Number(levelId.slice(3)),2);
 const state=Object.freeze({seed,levelId});modules.set(state,m);return state;
}
export interface Observation {motion:'blocked'|'moving'|'still';objective:string;objective_bearing:number;objective_distance:'near'|'nearby'|'far';terror:'steady'|'shaken'|'terrified'|'breaking';radio_log:string;tic:number;health:number;armor:number;rounds:number;purge:number;weapon:string;weapons:string[];keys:string[];aim:'steady'|'shaky'|'very shaky';entities:{bearing_deg:number;distance:number;elevation_deg:number;type:string}[];automap:string;map_cell_units:number;heading_deg:number;events:string[];summary:string}
export function observe(state:EngineState,player_id='player'):Observation {
 if(player_id!=='player')throw Error('Unknown player');const m=moduleOf(state);
 const raw=JSON.parse(m.UTF8ToString(m._tremor_agent_observe())) as Omit<Observation,'summary'>;
 return {...raw,summary:JSON.stringify(raw)};
}
export function legal_actions(_state:EngineState,_player_id='player'):ActionId[]{return [...ACTION_IDS];}
export interface StepResult {state:EngineState;events:string[];valid:boolean;reason:string|null}
export function step(state:EngineState,action:string):StepResult;
export function step(state:EngineState,player_id:string,action:string):StepResult;
export function step(state:EngineState,playerOrAction:string,action?:string):StepResult {
 const id=action??playerOrAction;const terminal=outcome(state).done;
 const reason=action!==undefined&&playerOrAction!=='player'?'unknown player':!ACTION_IDS.includes(id as ActionId)?'unknown action':terminal?'episode terminal':null;
 // Validation never consults identity, geometry, charges, or inventory. Invalid
 // actions consume the same seven tics with idle input, unless already terminal.
 if(!terminal)moduleOf(state)._tremor_agent_step(reason?13:ACTION_IDS.indexOf(id as ActionId));
 return {state,events:observe(state).events,valid:reason===null,reason};
}
export function terminate(state:EngineState,reason:TerminalReason){const code={exit:1,dead:2,step_limit:3,call_limit:4,timeout:5}[reason];moduleOf(state)._tremor_agent_terminate(code);}
interface EngineOutcome {status:'ongoing'|'terminal';reason:TerminalReason|null;score:number;metrics:{kills_demons:number;kills_humans:number;crew_killed:number;crew_saved:number;reads:number;fired_unread:number;rounds_left:number;final_tremor:number;terror_bucket:Observation['terror'];tics:number}}
export function outcome(state:EngineState){const m=moduleOf(state),raw=JSON.parse(m.UTF8ToString(m._tremor_agent_outcome())) as EngineOutcome;return {...raw,done:raw.status==='terminal',reachedExit:raw.reason==='exit',dead:raw.reason==='dead',ticks:raw.metrics.tics,crewKilled:raw.metrics.crew_killed,crewSaved:raw.metrics.crew_saved,demonsKilled:raw.metrics.kills_demons,reads:raw.metrics.reads,firedUnread:raw.metrics.fired_unread,finalTremor:raw.metrics.final_tremor,finalTerrorBucket:raw.metrics.terror_bucket};}
