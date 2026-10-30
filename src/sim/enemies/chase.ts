import type { EnemyBrain } from '../types';
import { moveCircle } from '../geometry';
export const chase:EnemyBrain=(w,e)=>{if(e.state==='stunned'||e.state==='cured'||e.kind==='crew')return;const dx=w.player.pos.x-e.pos.x,dy=w.player.pos.y-e.pos.y,d=Math.hypot(dx,dy);if(d<6)e.alerted=true;if(!e.alerted)return;e.state='chase';e.angle=Math.atan2(dy,dx);if(d>0.65)moveCircle(w,e.pos,dx/d*0.018,dy/d*0.018,e.radius);};
