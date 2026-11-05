import type {Observation} from '../player_interface';
import type {Controller} from './types';
import {ACTION_IDS,type ActionId} from './actions';

const wrap=(d:number)=>(d+540)%360-180;
function turn(b:number):ActionId {
 return `turn_${b>0?'left':'right'}_${Math.abs(b)>110?'large':Math.abs(b)>30?'medium':Math.abs(b)>5?'small':'fine'}`;
}
/** BFS on public mapped cells only. The public cue supplies the current quest waypoint,
 * including key/door dependencies. No world coordinates or engine imports are used.
 * At most 4096 cells are expanded; closest reachable cell breaks ties by BFS order. */
export function searchRoute(o:Observation):number {
 const rows=o.automap.trimEnd().split('\n'),w=rows[0]?.length??0;
 let sx=-1,sy=-1;
 for(let y=0;y<rows.length;y++){const x=rows[y].search(/[>^<v]/);if(x>=0){sx=x;sy=y;break;}}
 if(sx<0||!w)return o.objective_bearing;
 const angle=(o.heading_deg+o.objective_bearing)*Math.PI/180;
 const reach=256/o.map_cell_units,tx=sx+Math.cos(angle)*reach,ty=sy-Math.sin(angle)*reach;
 const start=sy*w+sx,queue=[start],parent=new Map<number,number>([[start,start]]);
 let best=start,bestDistance=Math.hypot(sx-tx,sy-ty);
 for(let i=0;i<queue.length&&i<4096;i++){
  const p=queue[i],x=p%w,y=Math.floor(p/w),d=Math.hypot(x-tx,y-ty);
  if(d<bestDistance){best=p;bestDistance=d;}
  for(const [dx,dy] of [[1,0],[0,-1],[-1,0],[0,1]]){
   const nx=x+dx,ny=y+dy,q=ny*w+nx,g=rows[ny]?.[nx];
   if(nx<0||nx>=w||!g||!'.dT>^<vDSbyr'.includes(g)||parent.has(q)||parent.size>=4096)continue;
   parent.set(q,p);queue.push(q);
  }
 }
 if(best===start)return o.objective_bearing;
 const path=[best];while(path.at(-1)!==start)path.push(parent.get(path.at(-1)!)!);
 // Look ahead up to four cells, stopping at a corner to avoid cutting walls.
 path.reverse();let next=path[1];
 const dx=next%w-sx,dy=Math.floor(next/w)-sy;
 for(let i=2;i<Math.min(path.length,5);i++){
  if(path[i]%w!==sx+dx*i||Math.floor(path[i]/w)!==sy+dy*i)break;next=path[i];
 }
 return wrap(Math.atan2(sy-Math.floor(next/w),next%w-sx)*180/Math.PI-o.heading_deg);
}

export function baseline_solver():Controller {
 let clock=0,lastUse=-10,stalls=0;
 return {id:'baseline_solver',async decide(o,legal,feedback){
  clock++;stalls=o.motion==='blocked'?stalls+1:0;
  const emit=(action:ActionId)=>({action:legal.includes(action)?action:ACTION_IDS.find(id=>legal.includes(id))??'wait'});
  const threats=o.entities.filter(e=>['unknown figure','possessed','Imp','Demon','Spectre','Cacodemon','Lost Soul'].includes(e.type)&&e.distance<400&&Math.abs(e.elevation_deg)<25).sort((a,b)=>a.distance-b.distance);
  const target=threats[0];
  if(o.rounds===0&&o.weapon!=='fist')return emit('weapon_fist');
  if(target){
   const b=target.bearing_deg;
   if(o.health<30&&target.distance<120&&clock%4!==0)return emit('back');
   if(target.type==='unknown figure')return emit(Math.abs(b)>15?`turn_${b>0?'left':'right'}_small_read`:Math.abs(b)>3?`turn_${b>0?'left':'right'}_fine_read`:'read');
   if(Math.abs(b)>12)return emit(turn(b));
   if(o.rounds>0&&o.weapon==='fist')return emit(o.weapons.includes('shotgun')?'weapon_shotgun':'weapon_pistol');
   return emit(target.distance>100?'forward':'fire');
  }
  const rows=o.automap.split('\n');let door=false;
  for(let y=0;y<rows.length;y++){const x=rows[y].search(/[>^<v]/);if(x<0)continue;
   const a=o.heading_deg*Math.PI/180;
   for(let d=1;d<=64/o.map_cell_units;d++)if('DSbyr'.includes(rows[y-Math.round(Math.sin(a)*d)]?.[x+Math.round(Math.cos(a)*d)]??'?'))door=true;
  }
  if((door||stalls>=2||o.objective_distance==='near')&&clock-lastUse>=5){lastUse=clock;return emit('use');}
  if(stalls>=3||feedback)return emit(clock%8<4?'strafe_right':'strafe_left');
  const b=searchRoute(o);
  return emit(Math.abs(b)>15?turn(b):Math.abs(b)>4?`advance_${b>0?'left':'right'}`:'forward');
 }};
}
