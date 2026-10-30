import type { World, GameEvent } from './sim/types';
import { createWorld, idleCmd, tick } from './sim/world';
import { bearing, visible, rayDistance } from './sim/geometry';
import { levels } from './levels';
export const STEP_TICS = 7;
export const ACTION_IDS = ['turn_left_small','turn_left_large','turn_right_small','turn_right_large','forward','back','strafe_left','strafe_right','fire','read','stun','purge','use','wait'] as const;
export type ActionId = typeof ACTION_IDS[number];
export type TerminalReason = 'exit'|'dead'|'step_limit'|'call_limit'|'timeout';
const memories = new WeakMap<World, Map<number,string>>();
const endings = new WeakMap<World,TerminalReason>();
export function terminate(state:World, reason:TerminalReason){ endings.set(state,reason); }
export function reset(seed:number,levelId='test_room'):World { const level=levels[levelId]; if(!level)throw new Error(`Unknown level: ${levelId}`); return createWorld(level,seed); }
export function observe(state:World,player_id='player') {
 if(player_id!=='player')throw new Error('Unknown player');
 const p=state.player,m=state.map,seen=memories.get(state)??new Map<number,string>(); memories.set(state,seen);
 const inView=(x:number,y:number)=>Math.abs(bearing(Math.atan2(y-p.pos.y,x-p.pos.x)-p.angle))<=Math.PI/3;
 for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++){
  const distance=Math.hypot(x+.5-p.pos.x,y+.5-p.pos.y),angle=Math.atan2(y+.5-p.pos.y,x+.5-p.pos.x);
    const hit=rayDistance(state,p.pos,angle,distance);
  const hitX=Math.floor(p.pos.x+Math.cos(angle)*(hit+.001)),hitY=Math.floor(p.pos.y+Math.sin(angle)*(hit+.001));
  if(distance<.7||(inView(x+.5,y+.5)&&(hit>=distance-.001||(hitX===x&&hitY===y)))){
   const door=m.doors.find(d=>d.x===x&&d.y===y);
   seen.set(y*m.width+x,door?'D':m.cells[y*m.width+x]>0?'#':'.');
  }
 }
 const entities=state.entities.filter(e=>e.health>0&&visible(state,e.pos)&&inView(e.pos.x,e.pos.y)).map(e=>({id:e.id,bearingDeg:bearing(Math.atan2(e.pos.y-p.pos.y,e.pos.x-p.pos.x)-p.angle)*180/Math.PI,distance:Math.hypot(e.pos.x-p.pos.x,e.pos.y-p.pos.y),kind:e.revealed?e.kind:'unknown figure',revealed:e.revealed,state:e.revealed?e.state:undefined}));
 const rows=Array.from({length:m.height},(_,y)=>Array.from({length:m.width},(_,x)=>seen.get(y*m.width+x)??'?'));
 const ex=Math.floor(m.exit.x),ey=Math.floor(m.exit.y);
 if(seen.get(ey*m.width+ex)==='.')rows[ey][ex]='E';
 for(const k of m.keys)if(!k.collected&&visible(state,k.pos)&&inView(k.pos.x,k.pos.y))rows[Math.floor(k.pos.y)][Math.floor(k.pos.x)]='K';
 rows[Math.floor(p.pos.y)][Math.floor(p.pos.x)]='@';
 // Raw kill events contain hidden kind/wasCrew; noise coordinates can reveal unseen activity.
 const events=state.log.slice(-5).map(e=>e.type==='radio'?{type:e.type,text:e.text}:e.type==='pickup'?{type:e.type,name:e.name}:{type:e.type});
 const aim=p.tremor<.5?'steady':p.tremor<2?'shaky':'very shaky';
 const automap=rows.map(r=>r.join('')).join('\n');
 const summary=`Health ${p.health}; armor ${p.armor}; ammo ${p.ammo}; purge ${p.purgeCharges}; keys ${p.keys.join(',')||'none'}. Your aim is ${aim}. Figures ${JSON.stringify(entities)}. Events ${JSON.stringify(events)}.\n${automap}`;
 return {tic:state.tic,health:p.health,armor:p.armor,ammo:p.ammo,purge:p.purgeCharges,keys:[...p.keys],aim,entities,events,automap,pose:{x:p.pos.x,y:p.pos.y,angle:p.angle},summary};
}
export type Observation=ReturnType<typeof observe>;
export function legal_actions(_state:World,_player_id='player'):ActionId[]{return [...ACTION_IDS];}
export function step(state:World,action:string):StepResult;
export function step(state:World,player_id:string,action:string):StepResult;
export function step(state:World,playerOrAction:string,action?:string):StepResult {
 const id=action??playerOrAction; let reason:string|undefined;
 if(action!==undefined&&playerOrAction!=='player')reason='unknown player';
 else if(!ACTION_IDS.includes(id as ActionId))reason='unknown action';
 else if(state.done||endings.has(state))reason='episode terminal';
 const aimed=state.entities.filter(e=>e.health>0&&visible(state,e.pos)&&Math.abs(bearing(Math.atan2(e.pos.y-state.player.pos.y,e.pos.x-state.player.pos.x)-state.player.angle))<Math.atan2(e.radius,Math.hypot(e.pos.x-state.player.pos.x,e.pos.y-state.player.pos.y))).sort((a,b)=>Math.hypot(a.pos.x-state.player.pos.x,a.pos.y-state.player.pos.y)-Math.hypot(b.pos.x-state.player.pos.x,b.pos.y-state.player.pos.y))[0];
 if(!reason&&id==='purge'&&(!aimed||aimed.kind!=='possessed'||aimed.state!=='stunned'||state.player.purgeCharges<=0||Math.hypot(aimed.pos.x-state.player.pos.x,aimed.pos.y-state.player.pos.y)>1.5))reason='purge unavailable: requires a nearby stunned target and charge';
 if(!reason&&id==='stun'&&(!aimed||Math.hypot(aimed.pos.x-state.player.pos.x,aimed.pos.y-state.player.pos.y)>2))reason='stun unavailable: no nearby aimed target';
 const events:GameEvent[]=[];
 // Invalid use consumes the same fixed simulation interval with idle input.
 for(let i=0;i<STEP_TICS&&!state.done&&!endings.has(state);i++){
 const c=idleCmd();if(!reason)switch(id){case 'forward':c.forward=1;break;case 'back':c.forward=-1;break;case 'strafe_left':c.strafe=-1;break;case 'strafe_right':c.strafe=1;break;case 'turn_left_small':c.turn=-Math.PI/36;break;case 'turn_right_small':c.turn=Math.PI/36;break;case 'turn_left_large':c.turn=-Math.PI/14;break;case 'turn_right_large':c.turn=Math.PI/14;break;case 'fire':c.fire=true;break;case 'read':c.read=true;break;case 'stun':c.stun=true;break;case 'purge':c.purge=true;break;case 'use':c.use=true;break;}tick(state,c);events.push(...state.events);observe(state);
 }return {state,events,valid:!reason,reason:reason??null};
}
export interface StepResult {state:World;events:GameEvent[];valid:boolean;reason:string|null}
export function outcome(state:World){const p=state.player,reason=endings.get(state)??state.outcome??null;const metrics={ticks:state.tic,crewKilled:p.kills.crew,crewSaved:p.saved,demonsKilled:p.kills.demons,reads:p.reads,firedUnread:p.firedUnread,finalTremor:p.tremor};return {status:reason?'terminal' as const:'ongoing' as const,reason,score:reason==='exit'?100:0,metrics,done:!!reason,reachedExit:reason==='exit',dead:p.health<=0,...metrics};}

