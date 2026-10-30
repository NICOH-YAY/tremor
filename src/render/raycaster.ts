import type { Renderer, World, PlayerPose, RenderView } from '../sim/types';
import { rayDistance } from '../sim/geometry';
const W=480,H=270;
const color=(r:number,g:number,b:number)=> (255<<24)|(b<<16)|(g<<8)|r;
export class Raycaster implements Renderer {
 private buffer=document.createElement('canvas'); private ctx:CanvasRenderingContext2D; private pixels:ImageData; private data:Uint32Array; private z=new Float64Array(W);
 constructor(private canvas:HTMLCanvasElement){this.buffer.width=W;this.buffer.height=H;this.ctx=this.buffer.getContext('2d')!;this.pixels=this.ctx.createImageData(W,H);this.data=new Uint32Array(this.pixels.data.buffer);}
 resize(w:number,h:number):void {this.canvas.width=w;this.canvas.height=h;}
 render(world:World,prev:PlayerPose,alpha:number,view:RenderView):void {
 const p={x:prev.pos.x+(world.player.pos.x-prev.pos.x)*alpha,y:prev.pos.y+(world.player.pos.y-prev.pos.y)*alpha};const delta=Math.atan2(Math.sin(world.player.angle-prev.angle),Math.cos(world.player.angle-prev.angle)),a=prev.angle+delta*alpha;
 for(let y=0;y<H;y++)this.data.fill(y<H/2?color(25,27,35):color(40,35,31),y*W,(y+1)*W);
 for(let x=0;x<W;x++){const offset=Math.atan((2*(x+0.5)/W-1)*0.66),ra=a+offset,d=rayDistance(world,p,ra),depth=Math.max(0.01,d*Math.cos(offset));this.z[x]=depth;
 const hx=p.x+Math.cos(ra)*d,hy=p.y+Math.sin(ra)*d,side=Math.abs(hx-Math.round(hx))<0.001;const shade=(side?0.7:1)/(1+depth*0.09);const c=color(120*shade|0,130*shade|0,145*shade|0),height=Math.min(H*10,H/depth);for(let y=Math.max(0,Math.floor((H-height)/2));y<Math.min(H,(H+height)/2);y++)this.data[y*W+x]=c;}
 const sprites=world.entities.filter(e=>e.health>0).map(e=>{const dx=e.pos.x-p.x,dy=e.pos.y-p.y;return {e,depth:dx*Math.cos(a)+dy*Math.sin(a),lateral:-dx*Math.sin(a)+dy*Math.cos(a)};}).sort((a,b)=>b.depth-a.depth);
 for(const {e,depth,lateral} of sprites){if(depth<0.1)continue;const size=H/depth,cx=W/2+lateral/depth*W/1.32,c=e.kind==='ember'?color(210,85,35):color(140,155,115);for(let x=Math.max(0,Math.floor(cx-size/4));x<Math.min(W,cx+size/4);x++)if(depth<this.z[x])for(let y=Math.max(0,Math.floor(H/2-size/2));y<Math.min(H,H/2+size/2);y++)this.data[y*W+x]=c;}
 this.ctx.putImageData(this.pixels,0,0);const out=this.canvas.getContext('2d')!;out.imageSmoothingEnabled=false;out.drawImage(this.buffer,view.shake,0,this.canvas.width,this.canvas.height);
 }
}
