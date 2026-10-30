import type { Controller } from './types';
import type { Observation } from '../player_interface';
function navigate(o:Observation):string {
 const rows=o.automap.split('\n'),h=rows.length,w=rows[0].length,sx=Math.floor(o.pose.x),sy=Math.floor(o.pose.y);
 const queue=[{x:sx,y:sy,path:[] as {x:number;y:number}[]}],seen=new Set([`${sx},${sy}`]);let frontier:typeof queue[number]|undefined,exit:typeof queue[number]|undefined,keyTarget:typeof queue[number]|undefined;
 for(let i=0;i<queue.length;i++){
 const q=queue[i];if(rows[q.y][q.x]==='E')exit??=q;
 if(rows[q.y][q.x]==='K'){keyTarget=q;break;}
 if(!frontier&&q.path.length&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>rows[q.y+dy]?.[q.x+dx]==='?'))frontier=q;
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=q.x+dx,y=q.y+dy,key=`${x},${y}`;if(x>=0&&y>=0&&x<w&&y<h&&!seen.has(key)&&'.DKE@'.includes(rows[y][x])){seen.add(key);queue.push({x,y,path:[...q.path,{x,y}]});}}
 }
 frontier=keyTarget??exit??frontier;
 if(!frontier)return 'turn_right_large';
 const next=frontier.path[0];if(!next)return 'turn_right_large';
 const angle=Math.atan2(next.y+.5-o.pose.y,next.x+.5-o.pose.x)-o.pose.angle,delta=Math.atan2(Math.sin(angle),Math.cos(angle))*180/Math.PI;
 if(Math.abs(delta)>65)return delta>0?'turn_right_large':'turn_left_large';
 if(Math.abs(delta)>18)return delta>0?'turn_right_small':'turn_left_small';
 if(rows[next.y][next.x]==='D'&&Math.hypot(next.x+.5-o.pose.x,next.y+.5-o.pose.y)<1.5&&o.tic%21===0)return 'use';
 return 'forward';
}
export function baseline(careful=false):Controller {return {id:careful?'baseline_careful':'baseline_aggressive',async decide(o){
 const target=o.entities.filter(e=>Math.abs(e.bearingDeg)<8).sort((a,b)=>a.distance-b.distance)[0];
 let action:string|undefined;
 if(target){if(!careful)action=o.ammo?'fire':undefined;else if(!target.revealed)action='read';else if(target.kind==='possessed'&&o.purge>0){action=target.distance>1.2?'forward':target.state==='stunned'?'purge':'stun';}else if(['possessed','ember','hound'].includes(target.kind)&&target.state!=='cured')action=o.ammo?'fire':undefined;}
 return {action:action??navigate(o)};
 }};}
export const baseline_aggressive=()=>baseline(false);
export const baseline_careful=()=>baseline(true);
