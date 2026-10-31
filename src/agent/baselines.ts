import type {Controller} from './types';
import type {Observation} from '../player_interface';
const norm=(a:number)=>((a+540)%360)-180;
const hostile=new Set(['unknown figure','possessed','Imp','Demon','Spectre','Cacodemon','Baron of Hell','Hell Knight','Lost Soul','Cyberdemon','Spider Mastermind','Revenant','Mancubus','Arch-vile','Arachnotron','Pain Elemental']);
/** Bounded memory, entirely derived from the public map, view and HUD. */
export function baseline(careful=false):Controller {
 let attempts=new Uint8Array(0),visits=new Uint16Array(0),blocked=new Uint8Array(0),size=0,lastCell=-1,lastAction='',stuck=0,purgeLeft=0,combat=0,lastObjective='',recover=0;
 let doorPush=0,supplySteps=0,lastHealth=100,scan=0,moveWindow=0,navTarget=-1,lastStun=-100,navClock=0;
 let supplyMemory:{x:number;y:number;type:string;ttl:number}|undefined;
 let rays:{x:number;y:number;b:number}[]=[];
 function turn(bearing:number):string|null {
  const a=Math.abs(bearing);if(a<3)return null;
  return `turn_${bearing>0?'left':'right'}_${a>65?'large':a>8?'small':'fine'}`;
 }
 function navigate(o:Observation,override?:{x:number;y:number}):string {
  const rows=o.automap.split('\n'),n=rows.length;let map=rows.join('');const cell=map.search(/[>^<v]/);
  if(cell<0)return 'forward';
  const cells=map.split('');
  for(const e of o.entities)if(['obstacle','explosive barrel','crew'].includes(e.type)){
   const a=(o.heading_deg+e.bearing_deg)*Math.PI/180,x=Math.round(cell%n+Math.cos(a)*e.distance/o.map_cell_units),y=Math.round(Math.floor(cell/n)-Math.sin(a)*e.distance/o.map_cell_units);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const v=(y+dy)*n+x+dx;if(v>=0&&v<cells.length&&v!==cell)cells[v]='#';}
  }
  map=cells.join('');
  if(size!==n||(Math.abs(cell%n-lastCell%n)>12||Math.abs(Math.floor(cell/n)-Math.floor(lastCell/n))>12)){navTarget=-1;rays=[];supplyMemory=undefined;size=n;attempts=new Uint8Array(n*n);visits=new Uint16Array(n*n);blocked=new Uint8Array(n*n);}
  ++navClock;
  if(lastObjective!==o.objective){lastObjective=o.objective;blocked.fill(0);attempts.fill(0);rays=[];}
  if(cell!==lastCell){for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const v=cell+dy*n+dx;if(v>=0&&v<visits.length)visits[v]=Math.min(60000,visits[v]+1);}stuck=0;}else if((lastAction==='forward'||lastAction==='forward_slow'))stuck++;
  lastCell=cell;
  if(doorPush){doorPush--;return 'forward_slow';}
  if(recover){recover--;return recover===1?'back':recover===0?'turn_right_small':'use';}
  const locked=(v:number)=>map[v]==='#'||map[v]==='S'||(attempts[v]>=3&&map[v]!=='d')||('byr'.includes(map[v])&&!o.keys.some(k=>k.startsWith(({b:'blue',y:'yellow',r:'red'} as Record<string,string>)[map[v]])));
  const heading=o.heading_deg*Math.PI/180;
  const ahead=cell-Math.round(Math.sin(heading))*n+Math.round(Math.cos(heading));
  if(o.motion==='blocked'&&['forward','forward_slow','sprint'].includes(lastAction)&&ahead>=0&&map[ahead]!=='D'&&map[ahead]!=='S'){blocked[ahead]=2;navTarget=-1;stuck=0;}
  if(stuck>=3){stuck=0;navTarget=-1;if(ahead>=0&&ahead<blocked.length)blocked[ahead]=Math.min(255,blocked[ahead]+2);recover=3;return 'use';}
  // Use marker ahead, and probe a nearby objective switch without omniscient tags.
  let activation=-1;
  // USE reaches64 units: the marker may be four16-unit map pixels away.
  for(let distance=1;distance<=Math.ceil(64/o.map_cell_units);distance++){
   const v=cell-Math.round(Math.sin(heading)*distance)*n+Math.round(Math.cos(heading)*distance);
   if(v<0||v>=n*n||map[v]==='#')break;
   if(attempts[v]<3&&(map[v]==='D'||map[v]==='S'||('byr'.includes(map[v])&&!locked(v)))){activation=v;break;}
  }
  if(activation>=0&&lastAction!=='use'){
   attempts[activation]++;
   if(attempts[activation]>=3){const q=[activation],seen=new Set<number>();while(q.length){const v=q.pop()!;if(seen.has(v)||map[v]!==map[activation])continue;seen.add(v);attempts[v]=3;for(const w of [v-1,v+1,v-n,v+n])if(w>=0&&w<n*n&&Math.abs(w%n-v%n)<=1)q.push(w);}}
   doorPush=5;return 'use';
  }
  if(o.objective_distance==='near'&&Math.abs(o.objective_bearing)<12&&lastAction!=='use'&&(lastAction==='forward'||lastAction==='forward_slow'))return 'use';
  const cx=cell%n,cy=Math.floor(cell/n),bearing=(o.heading_deg+o.objective_bearing)*Math.PI/180;
  const radius=o.objective_distance==='near'?4:o.objective_distance==='nearby'?16:56;
  let tx=cx+Math.cos(bearing)*radius,ty=cy-Math.sin(bearing)*radius;
  if(!rays.length||Math.hypot(cx-rays.at(-1)!.x,cy-rays.at(-1)!.y)>2){rays.push({x:cx,y:cy,b:bearing});if(rays.length>32)rays.shift();}
  let aa=0,ab=0,bb=0,ac=0,bc=0;
  for(const r of rays){const a=Math.sin(r.b),b=Math.cos(r.b),c=a*r.x+b*r.y;aa+=a*a;ab+=a*b;bb+=b*b;ac+=a*c;bc+=b*c;}
  const det=aa*bb-ab*ab;
  if(det>.03){const x=(ac*bb-bc*ab)/det,y=(bc*aa-ac*ab)/det;if(x>1&&x<n-1&&y>1&&y<n-1){tx=x;ty=y;}}
  if(override){tx=override.x;ty=override.y;}
  // Optimistic reverse BFS through unknown cells plans exploration using only
  // the public map. Real movement still follows discovered floor/frontiers.
  const optimistic=new Int32Array(n*n).fill(-1),oq=new Int32Array(n*n);let oh=0,ot=1;
  let dest=Math.max(0,Math.min(n*n-1,Math.round(ty)*n+Math.round(tx)));
  if(locked(dest)||blocked[dest]>=2){let cost=Infinity;for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++){const v=(Math.round(ty)+dy)*n+Math.round(tx)+dx;if(v<0||v>=n*n||locked(v)||blocked[v]>=2)continue;const c=Math.hypot(dx,dy);if(c<cost){cost=c;dest=v;}}}
  oq[0]=dest;optimistic[dest]=0;
  while(oh<ot){const at=oq[oh++],x=at%n,y=Math.floor(at/n);for(const v of [at-1,at+1,at-n,at+n]){if(v<0||v>=n*n||Math.abs(v%n-x)>1||optimistic[v]>=0||locked(v)||blocked[v]>=2)continue;optimistic[v]=optimistic[at]+1;oq[ot++]=v;}}

  if(optimistic[cell]<0){
   const q=new Int32Array(n*n),parents=new Int32Array(n*n).fill(-1);let h=0,t=1;q[0]=cell;parents[cell]=cell;let best=cell,bestCost=Infinity;
   while(h<t){const at=q[h++],x=at%n,y=Math.floor(at/n);
    for(const v of [at-1,at+1,at-n,at+n]){
     if(v<0||v>=n*n||Math.abs(v%n-x)>1||parents[v]>=0||locked(v)||blocked[v]>=2)continue;
     parents[v]=at;
     if(map[v]==='?'){
      const cost=Math.hypot(v%n-tx,Math.floor(v/n)-ty)+visits[at]*3;
      if(cost<bestCost){best=v;bestCost=cost;}
     }else q[t++]=v;
    }
   }
   let distance=0;for(let v=best;v!==cell&&v>=0;v=parents[v])optimistic[v]=distance++;optimistic[cell]=distance;
  }
  let at=cell;const path:number[]=[];
  // Follow a shortest optimistic route on the discovered automap. Unknown
  // space is a hypothesis, never supplied hidden geometry; collisions replan it.
  for(let k=0;k<8;k++){
   let next=-1,score=Infinity;const x=at%n,y=Math.floor(at/n);
   for(const v of [at-1,at+1,at-n,at+n]){
    if(v<0||v>=n*n||Math.abs(v%n-x)>1||locked(v)||blocked[v]>=2||optimistic[v]<0||path.includes(v))continue;
    if(optimistic[at]>0&&optimistic[v]>=optimistic[at])continue;const cost=optimistic[v];
    if(cost<score){score=cost;next=v;}
   }
   if(next<0||next===cell)break;path.push(next);at=next;
   if(optimistic[at]===0)break;
  }
  if(!path.length){
   navTarget=-1;
   if(o.motion==='blocked'&&['forward','forward_slow','sprint'].includes(lastAction))return 'back';
   const candidates=[cell-1,cell+1,cell-n,cell+n].filter(v=>v>=0&&v<n*n&&!locked(v)&&blocked[v]<2).sort((a,b)=>(visits[a]??0)-(visits[b]??0));
   const fallback=candidates[0];if(fallback===undefined)return 'turn_left_large';
   const a=Math.atan2(cy-Math.floor(fallback/n),fallback%n-cx)*180/Math.PI;return turn(norm(a-o.heading_deg))??'forward_slow';
  }
  let next=path[0];
  // Look ahead only along one straight segment; never cut a mapped corner.
  for(let i=1;i<Math.min(path.length,4);i++){
   if((path[i]%n-cx)*(Math.floor(next/n)-cy)!==(next%n-cx)*(Math.floor(path[i]/n)-cy))break;
   next=path[i];
  }
  if(navTarget<0||Math.hypot(navTarget%n-cx,Math.floor(navTarget/n)-cy)<1.5||locked(navTarget)||blocked[navTarget]>=2)navTarget=next;
  next=navTarget;
  const angle=Math.atan2(cy-Math.floor(next/n),next%n-cx)*180/Math.PI;
  if(!override&&o.objective_distance==='near'&&blocked[ahead]===0&&!locked(ahead)){
   const aim=turn(o.objective_bearing);if(aim)return aim;
   return lastAction==='forward_slow'?'use':'forward_slow';
  }
  return turn(norm(angle-o.heading_deg))??(path.length>6?'forward':'forward_slow');
 }
 return {id:careful?'baseline_careful':'baseline_aggressive',async decide(o){
  let action:string;
  const barrel=o.entities.filter(e=>e.type==='explosive barrel').sort((a,b)=>a.distance-b.distance)[0];
  const danger=o.entities.filter(e=>hostile.has(e.type)).sort((a,b)=>a.distance-b.distance)[0];
  if(o.health<lastHealth&&!danger)scan=4;if(danger)scan=0;lastHealth=o.health;
  const supply=o.entities.filter(e=>(e.type==='shotgun'&&!o.weapons.includes('shotgun'))||(o.health<65&&['medikit','stimpack','soul sphere'].includes(e.type))||(o.armor<30&&['green armor','blue armor'].includes(e.type))).sort((a,b)=>a.distance-b.distance)[0];
  const mapRows=o.automap.split('\n'),mapN=mapRows.length,mapCell=mapRows.join('').search(/[>^<v]/);
  if(supply){const a=(o.heading_deg+supply.bearing_deg)*Math.PI/180;supplyMemory={x:mapCell%mapN+Math.cos(a)*supply.distance/o.map_cell_units,y:Math.floor(mapCell/mapN)-Math.sin(a)*supply.distance/o.map_cell_units,type:supply.type,ttl:90};}
  if(supplyMemory&&(--supplyMemory.ttl<=0||(supplyMemory.type==='shotgun'&&o.weapons.includes('shotgun'))||(supplyMemory.type!=='shotgun'&&o.health>=85)))supplyMemory=undefined;
  if(careful&&o.tic===0&&o.weapon==='pistol')action='weapon_fist';
  else if(barrel&&barrel.distance<190&&danger&&Math.abs(barrel.bearing_deg-danger.bearing_deg)<30){action=barrel.distance<130?'back':'strafe_right';}
  else if(scan&&!danger){scan--;action='turn_left_large';}
  else if(supplyMemory&&supplySteps++<90&&(supplyMemory.type==='shotgun'||!danger||danger.distance>120)&&!purgeLeft){action=navigate(o,supplyMemory);}
  else if(purgeLeft>0){purgeLeft--;action='purge';}
  else {
   const target=o.entities.filter(e=>hostile.has(e.type)).sort((a,b)=>(Math.abs(a.bearing_deg)*2+a.distance*.1)-(Math.abs(b.bearing_deg)*2+b.distance*.1))[0];
   if(target&&combat++<100&&!moveWindow){
    const aim=turn(target.bearing_deg);
    if(aim&&Math.abs(target.distance*Math.sin(target.bearing_deg*Math.PI/180))>18)action=aim.endsWith('large')?aim:aim+(careful&&target.type==='unknown figure'?'_read':'_fire');
    else if(!careful&&target.type==='unknown figure'&&o.rounds>0&&combat<=5)action=o.weapon==='fist'?'weapon_pistol':'fire';
    else if(careful&&target.type==='unknown figure')action=target.distance>120?'advance_read':'read';
    else if(careful&&target.type==='possessed'&&o.purge>0){if(target.distance>55)action='sprint';else{purgeLeft=5;action='stun';}}
    else if(['unknown figure','possessed'].includes(target.type)&&target.distance<64&&o.tic-lastStun>=35){lastStun=o.tic;action='stun';}
    else if((o.rounds===0||(careful&&!o.weapons.includes('shotgun')&&Math.abs(target.elevation_deg)<30))&&o.weapon!=='fist')action='weapon_fist';
    else if(o.rounds>0&&target.distance>100&&o.weapons.includes('shotgun')&&o.weapon!=='shotgun')action='weapon_shotgun';
    else if(o.rounds>0&&o.weapon==='fist'&&(!careful||Math.abs(target.elevation_deg)>30))action='weapon_pistol';
    else if(o.weapon!=='fist'&&o.health<35&&target.distance<180)action=combat%3?'back_fire':'strafe_right_fire';
    else if(o.weapon==='fist'&&target.distance>55)action=o.motion==='blocked'||combat%8<4?'approach_right_fire':'approach_left_fire';
    else if(o.weapon!=='fist'&&target.distance>400&&combat%3===0)action='advance_fire';else if(o.weapon!=='fist'&&combat%3!==0)action=combat%2?'strafe_left_fire':'strafe_right_fire';else action='fire';
   }else{if(!moveWindow)moveWindow=5;moveWindow--;if(!moveWindow)combat=0;supplySteps=0;action=navigate(o);if(target&&(!careful||target.type!=='unknown figure')&&Math.abs(target.bearing_deg)<15&&['forward','sprint'].includes(action))action='advance_fire';}
  }
  lastAction=action;return {action};
 }};
}
export const baseline_aggressive=()=>baseline(false);
export const baseline_careful=()=>baseline(true);
