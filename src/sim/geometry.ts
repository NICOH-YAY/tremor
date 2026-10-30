import type { World, Vec2 } from './types';
export function blocked(w:World,x:number,y:number):boolean {
 const m=w.map; if(x<0||y<0||x>=m.width||y>=m.height)return true;
 const d=m.doors.find(d=>d.x===x&&d.y===y); return d ? d.sealed===true||d.openAmount<0.85 : m.cells[y*m.width+x]>0;
}
export function canOccupy(w:World,p:Vec2,r:number):boolean {
 for(let y=Math.floor(p.y-r);y<=Math.floor(p.y+r);y++)for(let x=Math.floor(p.x-r);x<=Math.floor(p.x+r);x++)if(blocked(w,x,y)){
 const dx=p.x-Math.max(x,Math.min(x+1,p.x)),dy=p.y-Math.max(y,Math.min(y+1,p.y)); if(dx*dx+dy*dy<r*r)return false;
 }return true;
}
export function moveCircle(w:World,p:Vec2,dx:number,dy:number,r:number):void {
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/0.1));for(let i=0;i<steps;i++){if(canOccupy(w,{x:p.x+dx/steps,y:p.y},r))p.x+=dx/steps;if(canOccupy(w,{x:p.x,y:p.y+dy/steps},r))p.y+=dy/steps;}
}
export function rayDistance(w:World,p:Vec2,angle:number,max=64):number {
 const dx=Math.cos(angle),dy=Math.sin(angle);let x=Math.floor(p.x),y=Math.floor(p.y);
 const sx=dx<0?-1:1,sy=dy<0?-1:1,ddx=Math.abs(1/dx),ddy=Math.abs(1/dy);
 let tx=(dx<0?p.x-x:x+1-p.x)*ddx,ty=(dy<0?p.y-y:y+1-p.y)*ddy;
 for(let i=0;i<256;i++){let t:number;if(tx<ty){t=tx;tx+=ddx;x+=sx;}else{t=ty;ty+=ddy;y+=sy;}if(t>max)return max;if(blocked(w,x,y))return t;}return max;
}
export function bearing(a:number):number {return Math.atan2(Math.sin(a),Math.cos(a));}
export function visible(w:World,p:Vec2):boolean { const d=Math.hypot(p.x-w.player.pos.x,p.y-w.player.pos.y);return rayDistance(w,w.player.pos,Math.atan2(p.y-w.player.pos.y,p.x-w.player.pos.x),d)>=d-0.05; }
