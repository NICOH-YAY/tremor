import type {Controller} from './types';
import type {Observation} from '../player_interface';
/** Both controllers consume only the public observation and keep bounded local memory. */
export function baseline(careful=false):Controller {
 let previousMap='',stalled=0,purgeLeft=0,turns=0;
 const visits=new Map<string,number>();
 function navigate(o:Observation):string {
  const rows=o.automap.split('\n'),c=Math.floor(rows.length/2),arrow=rows[c]?.[c]??'>';
  const dirs:{[key:string]:[number,number]}={'>':[1,0],'^':[0,-1],'<':[-1,0],'v':[0,1]};
  const [dx,dy]=dirs[arrow]??[1,0];
  const ahead=rows[c+dy]?.[c+dx];
  const signature=o.automap;
  const count=visits.get(signature)??0;visits.set(signature,count+1);
  if(visits.size>256)visits.delete(visits.keys().next().value!);
  if(previousMap===signature)stalled++;else stalled=0;
  previousMap=signature;
  // Doors and exit switches use Doom's ordinary use action. Repeated maps
  // detect blocked progress without querying geometry or hidden coordinates.
  if(stalled%6===3)return 'use';
  const left=rows[c-dx]?.[c+dy],right=rows[c+dx]?.[c-dy];
  if(ahead==='#'){
   stalled=0;
   if(left!=='#'&&right==='#')return 'turn_left_large';
   if(right!=='#'&&left==='#')return 'turn_right_large';
   // Prefer the side with more unseen map, with a deterministic tie break.
   const unknown=(sx:number,sy:number)=>{let n=0;for(let i=1;i<=4;i++)for(let j=-2;j<=2;j++)if(rows[c+sy*i+sx*j]?.[c+sx*i-sy*j]==='?')n++;return n;};
   return unknown(dy,-dx)>unknown(-dy,dx)?'turn_left_large':'turn_right_large';
  }
  if(stalled>=8||count>16){stalled=0;turns++;return turns%5===0?'turn_left_large':'turn_right_large';}
  return 'forward';
 }
 return {id:careful?'baseline_careful':'baseline_aggressive',async decide(o){
  if(purgeLeft>0){purgeLeft--;return {action:'purge'};}
  const target=o.entities.filter(e=>!['crew','supply'].includes(e.type)&&(['unknown figure','possessed','Imp','Demon','Spectre','Cacodemon','Baron of Hell','Lost Soul','Cyberdemon','Spider Mastermind'].includes(e.type))).sort((a,b)=>a.distance-b.distance)[0];
  if(target){
   // Doom bearings are positive counterclockwise (left).
   if(Math.abs(target.bearing_deg)>20)return {action:target.bearing_deg>0?'turn_left_small':'turn_right_small'};
   const cross=target.distance*Math.sin(target.bearing_deg*Math.PI/180);
   if(Math.abs(cross)>12)return {action:cross>0?'strafe_left':'strafe_right'};
   if(careful&&target.type==='unknown figure')return {action:'read'};
   if(careful&&target.type==='possessed'&&o.purge>0){
    if(target.distance>60)return {action:'forward'};
    purgeLeft=5;return {action:'stun'};
   }
   if(!o.rounds&&o.weapon!=='fist')return {action:'weapon_fist'};
   if(!o.rounds&&target.distance>60)return {action:'forward'};
   return {action:'fire'};
  }
  return {action:navigate(o)};
 }};
}
export const baseline_aggressive=()=>baseline(false);
export const baseline_careful=()=>baseline(true);
