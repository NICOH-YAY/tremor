import { TICRATE, type World, type LevelDef, type InputCmd, type Entity } from './types';
import { brains, rules } from './registry';
import { moveCircle, rayDistance, visible, bearing } from './geometry';
import { worldRng } from './rng';
export const idleCmd = ():InputCmd => ({forward:0,strafe:0,turn:0,fire:false,stun:false,purge:false,use:false,read:false});
export function createWorld(level:LevelDef,seed:number):World {
 return {tic:0,seed:seed>>>0,rngState:seed>>>0,map:structuredClone(level.map),player:{pos:{...level.map.spawns[0]},vel:{x:0,y:0},angle:0,health:100,armor:0,ammo:50,purgeCharges:3,keys:[],tremor:0,readTargetId:null,weaponCooldown:0,bob:0,kills:{crew:0,demons:0},saved:0,reads:0,firedUnread:0},entities:level.entities.map((s,i)=>({id:i+1,kind:s.kind,pos:{...s.pos},angle:s.angle??0,radius:s.radius??0.25,health:s.health??40,state:'idle',stateTics:0,alerted:false,readProgress:0,revealed:false,collar:s.collar,data:{...s.data}})),events:[],log:[],levelId:level.id,radio:structuredClone(level.radio??[]),done:false};
}
function target(w:World,angle:number):Entity|undefined {
 const p=w.player.pos, wall=rayDistance(w,p,angle);let best=wall,hit:Entity|undefined;
 for(const e of w.entities){if(e.health<=0||e.kind==='pickup')continue;const dx=e.pos.x-p.x,dy=e.pos.y-p.y,along=dx*Math.cos(angle)+dy*Math.sin(angle),cross=dx*Math.sin(angle)-dy*Math.cos(angle);if(along>0&&Math.abs(cross)<e.radius){const entry=along-Math.sqrt(e.radius*e.radius-cross*cross);if(entry<best){best=entry;hit=e;}}}return hit;
}
export function tick(w:World,c:InputCmd):void {
 if(w.done)return;w.events=[];w.tic++;const p=w.player,rng=worldRng(w);
 p.angle=bearing(p.angle+c.turn);const f=Math.max(-1,Math.min(1,c.forward)),s=Math.max(-1,Math.min(1,c.strafe));
 p.vel.x=(p.vel.x+(Math.cos(p.angle)*f-Math.sin(p.angle)*s)*0.035)*0.78;p.vel.y=(p.vel.y+(Math.sin(p.angle)*f+Math.cos(p.angle)*s)*0.035)*0.78;
 moveCircle(w,p.pos,p.vel.x,p.vel.y,0.22);p.bob+=Math.hypot(p.vel.x,p.vel.y);p.weaponCooldown=Math.max(0,p.weaponCooldown-1);
 for(const d of w.map.doors){if(d.state==='opening'){d.openAmount=Math.min(1,d.openAmount+0.08);if(d.openAmount===1)d.state='open';}if(d.state==='closing'){d.openAmount=Math.max(0,d.openAmount-0.08);if(d.openAmount===0)d.state='closed';}}
 if(c.use)for(const d of w.map.doors)if(Math.hypot(d.x+0.5-p.pos.x,d.y+0.5-p.pos.y)<1.6&&!d.sealed&&(!d.key||p.keys.includes(d.key))&&d.state==='closed'){d.state='opening';w.events.push({type:'door',x:d.x,y:d.y,state:d.state});}
 const aimed=target(w,p.angle);p.readTargetId=c.read&&aimed&&visible(w,aimed.pos)?aimed.id:null;
 // Recognition, stun and purge behavior belongs to rules; input is exposed as transient entity data.
 for(const e of w.entities){e.data.reading=p.readTargetId===e.id;e.data.stunRequested=!!c.stun&&aimed?.id===e.id;e.data.purgeRequested=!!c.purge&&aimed?.id===e.id;}
 if(c.fire&&p.weaponCooldown===0&&p.ammo>0){p.ammo--;p.weaponCooldown=8;const hit=target(w,p.angle+(rng()-0.5)*(0.008+p.tremor*0.025));w.events.push({type:'fire',hitId:hit?.id??null},{type:'noise',pos:{...p.pos}});if(hit&&!hit.revealed)p.firedUnread++;for(const r of rules)r.onFire?.(w,hit?.id??null);if(hit){hit.health-=40;w.events.push({type:'hit',id:hit.id,amount:40});if(hit.health<=0){hit.state='dead';const wasCrew=hit.kind==='possessed'||hit.kind==='crew';if(wasCrew)p.kills.crew++;else p.kills.demons++;w.events.push({type:'kill',id:hit.id,kind:hit.kind,wasCrew});for(const r of rules)r.onKill?.(w,hit);}}}
 for(const e of w.entities)if(e.health>0){e.stateTics++;brains[e.kind]?.(w,e,rng);}
 const unread=new Set(w.entities.filter(e=>!e.revealed).map(e=>e.id));
 for(const r of rules)r.onTic?.(w);
 for(const e of w.entities)if(e.revealed&&unread.has(e.id)){p.reads++;w.events.push({type:'read',id:e.id});for(const r of rules)r.onRead?.(w,e);}
 for(const message of w.radio??[])if(message.tic===w.tic)w.events.push({type:'radio',text:message.text});
 for(const k of w.map.keys)if(!k.collected&&Math.hypot(k.pos.x-p.pos.x,k.pos.y-p.pos.y)<0.5){k.collected=true;if(!p.keys.includes(k.color))p.keys.push(k.color);w.events.push({type:'pickup',name:k.color+' key'});}
 for(const t of w.map.triggers)if(!t.fired&&Math.hypot(t.pos.x-p.pos.x,t.pos.y-p.pos.y)<t.radius){t.fired=true;if(t.text)w.events.push({type:'radio',text:t.text});}
 if(p.health<=0){w.done=true;w.outcome='dead';}else if(Math.hypot(p.pos.x-w.map.exit.x,p.pos.y-w.map.exit.y)<0.5){w.done=true;w.outcome='exit';w.events.push({type:'levelEnd'});}
 w.log.push(...w.events);w.log=w.log.slice(-100);
}
export { TICRATE };

