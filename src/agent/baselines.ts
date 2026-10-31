import type {Controller} from './types';
/** Finite memory; all decisions use only the human-visible route, HUD and view. */
export function baseline(careful=false):Controller {
 let clock=0,lastUse=-100,stalls=0,purge=0,read=0,fight=0,supplySteps=0;
 let previousHealth=100,lastHurt=-100,lastRetreat=-100,retreat=0,lastCell=-1;
 const safe:number[]=[];
 const visits=new Map<number,number>();let recovery=0;
 return {id:careful?'baseline_careful':'baseline_aggressive',async decide(o){
  clock++;if(o.motion==='moving')stalls=0;else if(o.motion==='blocked')stalls++;
  const rows=o.automap.split('\n'),n=rows.length,cell=rows.join('').search(/[>^<v]/),heading=o.heading_deg*Math.PI/180;
  if(lastCell>=0&&Math.abs(cell%n-lastCell%n)+Math.abs(Math.floor(cell/n)-Math.floor(lastCell/n))>30){safe.length=0;visits.clear();}
  if(cell!==lastCell&&o.motion==='moving'){const v=(visits.get(cell)??0)+1;visits.set(cell,v);if(v>=5){recovery=12;visits.clear();}}
  lastCell=cell;
  const damage=Math.max(0,previousHealth-o.health);previousHealth=o.health;
  if(damage)lastHurt=clock;
  if(!retreat&&clock-lastHurt>10&&o.motion==='moving'&&safe.at(-1)!==cell){safe.push(cell);if(safe.length>24)safe.shift();}
  if(damage>=10&&stalls>=2&&o.health<65&&o.entities.filter(e=>['unknown figure','possessed','Imp','Demon'].includes(e.type)&&e.distance<512).length>2&&safe.length>4&&clock-lastRetreat>35){retreat=18;lastRetreat=clock;safe.splice(-3);purge=0;}
  let door=false;
  for(let d=1;d<=Math.ceil(64/o.map_cell_units);d++){const x=cell%n+Math.round(Math.cos(heading)*d),y=Math.floor(cell/n)-Math.round(Math.sin(heading)*d),glyph=rows[y]?.[x];if(glyph&&'DSbyr'.includes(glyph)){door=true;break;}}
  const supply=o.entities.filter(e=>e.distance<400&&Math.abs(e.elevation_deg)<20&&((e.type==='shotgun'&&!o.weapons.includes('shotgun'))||(o.health<70&&['medikit','stimpack','soul sphere','berserk'].includes(e.type))||(o.armor<30&&['green armor','blue armor'].includes(e.type))||(o.rounds<12&&['clip','box of bullets','shells','box of shells','backpack'].includes(e.type)))).sort((a,b)=>a.distance-b.distance)[0];
  const b=o.objective_bearing,a=Math.abs(b);
  const target=o.entities.filter(e=>['unknown figure','possessed','Imp','Demon','Spectre','Cacodemon','Lost Soul'].includes(e.type)&&e.distance<100&&Math.abs(e.bearing_deg)<45).sort((a,b)=>a.distance-b.distance)[0];
  let action:string;
  if(retreat){
   retreat--;
   while(safe.length&&Math.hypot(cell%n-safe.at(-1)!%n,Math.floor(cell/n)-Math.floor(safe.at(-1)!/n))<5)safe.pop();
   const dest=safe.at(-1);
   if(dest===undefined||stalls>2){retreat=0;action='strafe_right';}
   else {const d=(Math.atan2(Math.floor(cell/n)-Math.floor(dest/n),dest%n-cell%n)*180/Math.PI-o.heading_deg+540)%360-180;
    action=Math.abs(d)>20?`turn_${d>0?'left':'right'}_${Math.abs(d)>110?'large':Math.abs(d)>35?'medium':'small'}`:'forward';}
  }
  else if(recovery){recovery--;action=recovery>6?'strafe_left':'forward';}
  else if(clock===1&&o.weapon!=='fist')action='weapon_fist';
  else if(purge){purge--;action='purge';}
  else if(supply&&supplySteps++<20){const b=supply.bearing_deg;action=Math.abs(b)>15?`turn_${b>0?'left':'right'}_${Math.abs(b)>30?'medium':'small'}`:'forward';}
  else if(o.rounds===0&&o.weapon!=='fist')action='weapon_fist';
  else if(o.rounds>0&&o.weapons.includes('shotgun')&&o.weapon!=='shotgun')action='weapon_shotgun';
  else if(careful&&target?.type==='unknown figure'&&o.health>=90&&read<20){read++;const b=target.bearing_deg;action=Math.abs(b)>15?`turn_${b>0?'left':'right'}_small_read`:Math.abs(b)>3?`turn_${b>0?'left':'right'}_fine_read`:'read';}
  else if(careful&&target?.type==='possessed'&&target.distance<55&&Math.abs(target.bearing_deg)<5&&o.purge>0&&o.health>=40){purge=5;action='stun';}
  else if(target&&fight++<(careful?20:12)&&(!careful||target.type!=='unknown figure'||o.health<90)){const b=target.bearing_deg;
   action=!careful?(Math.abs(b)>12?`turn_${b>0?'left':'right'}_small_fire`:target.distance>50?'advance_fire':'fire'):
    Math.abs(b)>12?`turn_${b>0?'left':'right'}_small_fire`:target.distance>50?'advance_fire':'fire';}
  else if(door&&clock-lastUse>=5)action='use';
  else if(stalls>=2){action=clock-lastUse>=5?'use':clock%8<4?'strafe_right':'strafe_left';}
  else if(a>20)action=`turn_${b>0?'left':'right'}_${a>120?'large':a>30?'medium':'small'}`;


  else if(target&&(!careful||target.type!=='unknown figure'||o.health<90)&&target.distance<100){action=o.health<40&&target.distance<50?(clock%3?'strafe_right_fire':'back_fire'):'advance_fire';}
  else if(o.objective_distance==='near'&&a<15&&clock-lastUse>=4)action='use';
  else action=a>4?`advance_${b>0?'left':'right'}`:'forward';
  if(!target){read=0;fight=0;}if(!supply)supplySteps=0;
  if(action==='use')lastUse=clock;
  return {action};
 }};
}
export const baseline_aggressive=()=>baseline(false);
export const baseline_careful=()=>baseline(true);
