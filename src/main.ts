import { reset } from './player_interface';
import { idleCmd, tick, TICRATE } from './sim/world';
import { Raycaster } from './render/raycaster';
import { audio } from './audio';
import type { PlayerPose } from './sim/types';
document.body.style.cssText='margin:0;background:#090909;color:#eee;font-family:monospace;overflow:hidden';
const screen=document.createElement('canvas'),hud=document.createElement('canvas'),title=document.createElement('button');
screen.style.cssText=hud.style.cssText='position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated';hud.style.pointerEvents='none';title.textContent='TREMOR — click to begin';title.style.cssText='position:absolute;inset:35% 20%;background:#141419;color:#ddd;border:1px solid #555;font:32px monospace';document.body.append(screen,hud,title);
let world=reset(1),paused=true,started=false,renderer:Raycaster|undefined,prev:PlayerPose={pos:{...world.player.pos},angle:0};
const keys=new Set<string>();let mouse=0,right=false,left=false,fps=false,last=0,acc=0;
function pause(){paused=true;keys.clear();left=right=false;mouse=0;title.hidden=false;title.textContent='TREMOR — click to resume';document.exitPointerLock?.();}
title.onclick=()=>{started=true;paused=false;title.hidden=true;renderer??=new Raycaster(screen);resize();screen.requestPointerLock?.();};
function resize(){screen.width=hud.width=innerWidth;screen.height=hud.height=innerHeight;renderer?.resize(innerWidth,innerHeight);}
addEventListener('resize',resize);resize();addEventListener('blur',pause);
addEventListener('keydown',e=>{if(e.code==='Escape'){pause();return;}if(e.code==='Backquote')fps=!fps;keys.add(e.code);if(['ArrowLeft','ArrowRight','ControlLeft','Space'].includes(e.code))e.preventDefault();});addEventListener('keyup',e=>keys.delete(e.code));
document.addEventListener('pointerlockchange',()=>{if(started&&!document.pointerLockElement&&!paused)pause();});
screen.oncontextmenu=e=>e.preventDefault();screen.onmousedown=e=>{if(e.button===0)left=true;if(e.button===2)right=true;};addEventListener('mouseup',e=>{if(e.button===0)left=false;if(e.button===2)right=false;});addEventListener('mousemove',e=>{if(document.pointerLockElement===screen)mouse+=e.movementX*0.002;});
function frame(now:number){const dt=last?Math.min(0.2,(now-last)/1000):0;last=now;if(!paused){acc+=dt;while(acc>=1/TICRATE){prev={pos:{...world.player.pos},angle:world.player.angle};const c=idleCmd();c.forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS'));c.strafe=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));c.turn=mouse+(Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft')))*0.065;mouse=0;c.fire=left||keys.has('ControlLeft')||keys.has('ControlRight');c.use=keys.has('KeyE');c.stun=keys.has('KeyF');c.purge=keys.has('KeyQ');c.read=right||keys.has('KeyR');tick(world,c);for(const e of world.events)audio.play(e.type,undefined,world.player);acc-=1/TICRATE;if(world.done){pause();title.textContent=world.outcome==='exit'?'TREMOR — exit reached':'TREMOR — you died';break;}}}else acc=0;
 if(renderer){renderer.render(world,prev,paused?1:acc*TICRATE,{shake:0,flash:0,weaponSway:0,recoil:0,bob:world.player.bob});const ctx=hud.getContext('2d')!;ctx.clearRect(0,0,hud.width,hud.height);ctx.fillStyle='#eee';ctx.font='20px monospace';ctx.fillText(`HEALTH ${world.player.health}   AMMO ${world.player.ammo}   PURGE ${world.player.purgeCharges}   KEYS ${world.player.keys.join(' ')}`,20,hud.height-25);const drift=Math.sin(world.tic*0.4)*world.player.tremor*4;ctx.fillRect(hud.width/2+drift-5,hud.height/2,10,1);ctx.fillRect(hud.width/2+drift,hud.height/2-5,1,10);if(fps)ctx.fillText(`${Math.round(1/Math.max(dt,0.001))} FPS`,20,30);}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
