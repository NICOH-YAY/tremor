/** Shared contract. Coordinates are tile units; angles and turns are radians. */
export const TICRATE = 35;
export const SHOT_DAMAGE = 40;
export interface Vec2 { x: number; y: number }
export type Angle = number;
export type KeyColor = 'red' | 'blue';
export interface Door { x:number; y:number; key?:KeyColor|null; openAmount:number; state:'closed'|'opening'|'open'|'closing'; sealable?:boolean; sealed?:boolean }
export type EntityKind = 'possessed'|'ember'|'hound'|'crew'|'fireball'|'pickup';
export type EntityState = 'idle'|'chase'|'attack'|'pain'|'stunned'|'cured'|'dead'|'flee';
export interface Entity { id:number; kind:EntityKind; pos:Vec2; angle:Angle; radius:number; health:number; state:EntityState; stateTics:number; target?:number; alerted:boolean; readProgress:number; revealed:boolean; collar?:boolean; data:Record<string,number|string|boolean> }
export interface EntitySpawn { kind:EntityKind; pos:Vec2; angle?:Angle; health?:number; radius?:number; collar?:boolean; data?:Record<string,number|string|boolean> }
export interface MapKey { pos:Vec2; color:KeyColor; collected?:boolean }
export interface MapTrigger { id:string; pos:Vec2; radius:number; text?:string; fired?:boolean }
export interface TileMap { width:number; height:number; cells:number[]; doors:Door[]; light?:number[]; spawns:Vec2[]; keys:MapKey[]; exit:Vec2; triggers:MapTrigger[] }
export interface Player { pos:Vec2; vel:Vec2; angle:Angle; health:number; armor:number; ammo:number; purgeCharges:number; keys:KeyColor[]; tremor:number; readTargetId:number|null; weaponCooldown:number; bob:number; kills:{crew:number; demons:number}; saved:number; reads:number; firedUnread:number }
/** Axes are clamped to [-1,1] by tick; turn is radians this tic. */
export interface InputCmd { forward:number; strafe:number; turn:number; fire:boolean; stun:boolean; purge:boolean; use:boolean; read:boolean }
export type GameEvent = {type:'collarBreak'|'stun'|'alert'|'fireball'|'explosion';id:number}|{type:'fire';hitId:number|null}|{type:'hit';id:number;amount:number}|{type:'kill';id:number;kind:EntityKind;wasCrew:boolean}|{type:'cured';id:number}|{type:'noise';pos:Vec2}|{type:'pickup';name:string}|{type:'door';x:number;y:number;state:Door['state']}|{type:'radio';text:string}|{type:'levelEnd'}|{type:'playerHurt';amount:number}|{type:'read';id:number};
export interface World { tic:number; seed:number; rngState:number; map:TileMap; player:Player; entities:Entity[]; events:GameEvent[]; log:GameEvent[]; levelId:string; radio?:RadioTrigger[]; done:boolean; useHeld?:boolean; outcome?:'exit'|'dead' }
export type RNG = () => number;
export type EnemyBrain = (world:World, entity:Entity, rng:RNG) => void;
export interface RuleHook { name:string; onTic?(world:World):void; onFire?(world:World,hitId:number|null):void; onKill?(world:World,e:Entity):void; onRead?(world:World,e:Entity):void }
export interface RadioTrigger { tic:number; text:string }
export interface LevelDef { id:string; title:string; map:TileMap; entities:EntitySpawn[]; radio?:RadioTrigger[]; endText(world:World):string }
export interface PlayerPose { pos:Vec2; angle:Angle }
export interface RenderView { shake:number; flash:number; weaponSway:number; recoil:number; bob:number }
export interface Renderer { resize(w:number,h:number):void; render(world:World,prevPose:PlayerPose,alpha:number,view:RenderView):void }
export interface AudioBus { play(name:string,pos?:Vec2,listener?:PlayerPose):void }
