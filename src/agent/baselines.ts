import type {Controller} from './types';
/** Finite memory; all decisions use only the human-visible route, HUD and view. */
export function baseline(careful=false):Controller {
 let clock=0,lastUse=-100,stalls=0,purge=0,read=0,fight=0,supplySteps=0;
 return {id:careful?'baseline_careful':'baseline_aggressive',async decide(o){
  clock++;if(o.motion==='moving')stalls=0;else if(o.motion==='blocked')stalls++;
  const rows=o.automap.split('\n'),n=rows.length,cell=rows.join('').search(/[>^<v]/),heading=o.heading_deg*Math.PI/180;
  let door=false;
  for(let d=1;d<=Math.ceil(64/o.map_cell_units);d++){const x=cell%n+Math.round(Math.cos(heading)*d),y=Math.floor(cell/n)-Math.round(Math.sin(heading)*d),glyph=rows[y]?.[x];if(glyph&&'DSbyr'.includes(glyph)){door=true;break;}}
  const supply=o.entities.filter(e=>e.distance<400&&Math.abs(e.elevation_deg)<20&&((e.type==='shotgun'&&!o.weapons.includes('shotgun'))||(o.health<70&&['medikit','stimpack','soul sphere'].includes(e.type))||(o.armor<30&&['green armor','blue armor'].includes(e.type)))).sort((a,b)=>a.distance-b.distance)[0];
  const b=o.objective_bearing,a=Math.abs(b);
  const target=o.entities.filter(e=>['unknown figure','possessed','Imp','Demon','Spectre','Cacodemon','Lost Soul'].includes(e.type)&&e.distance<(careful&&e.type==='unknown figure'?180:100)&&Math.abs(e.bearing_deg)<45).sort((a,b)=>a.distance-b.distance)[0];
  let action:string;
  if(clock===1&&o.weapon!=='fist')action='weapon_fist';
  else if(purge){purge--;action='purge';}
  else if(supply&&supplySteps++<20){const b=supply.bearing_deg;action=Math.abs(b)>15?`turn_${b>0?'left':'right'}_${Math.abs(b)>30?'medium':'small'}`:'forward';}
  else if(o.weapons.includes('shotgun')&&o.weapon!=='shotgun')action='weapon_shotgun';
  else if(careful&&target?.type==='unknown figure'&&read<12){read++;const b=target.bearing_deg;action=Math.abs(b)>8?`turn_${b>0?'left':'right'}_small_read`:'read';}
  else if(careful&&target?.type==='possessed'&&target.distance<55&&Math.abs(target.bearing_deg)<5&&o.purge>0&&o.health>=40){purge=5;action='stun';}
  else if(target&&fight++<12&&(!careful||target.type!=='unknown figure')){const b=target.bearing_deg;action=Math.abs(b)>12?`turn_${b>0?'left':'right'}_small_fire`:target.distance>50?'advance_fire':'fire';}
  else if(door&&clock-lastUse>=5)action='use';
  else if(stalls>=2){action=clock-lastUse>=5?'use':clock%8<4?'strafe_right':'strafe_left';}
  else if(a>20)action=`turn_${b>0?'left':'right'}_${a>120?'large':a>30?'medium':'small'}`;


  else if(target&&(!careful||target.type!=='unknown figure')&&target.distance<100){action=o.health<40&&target.distance<50?(clock%3?'strafe_right_fire':'back_fire'):'advance_fire';}
  else if(o.objective_distance==='near'&&a<15&&clock-lastUse>=4)action='use';
  else action=a>4?`advance_${b>0?'left':'right'}`:'forward';
  if(!target){read=0;fight=0;}if(!supply)supplySteps=0;
  if(action==='use')lastUse=clock;
  return {action};
 }};
}
export const baseline_aggressive=()=>baseline(false);
export const baseline_careful=()=>baseline(true);
