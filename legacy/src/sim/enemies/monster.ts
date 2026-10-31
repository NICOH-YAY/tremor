/** Generic demon state machine (idle -> chase -> attack -> pain/stunned). Kinds plug in via MonsterCfg. */
import type { Entity, RNG, Vec2, World } from '../types';
import { bearing, visible } from '../geometry';
import {
  C, alive, angleTo, canSee, chaseStep, dist, entityById, isDemon, num,
} from './common';

export interface Target { pos: Vec2; radius: number; ent?: Entity }
export interface MonsterCfg {
  speed: number;
  windup: number;
  recover: number;
  period: number;
  melee: boolean;
  missile: boolean;
  /** Called when the monster starts an attack that is not melee. */
  fireMissile?(w: World, e: Entity, t: Target, rng: RNG): void;
  doMelee(w: World, e: Entity, t: Target, rng: RNG): void;
  /** Return true if the hook handled this tic (e.g. ember fleeing). */
  override?(w: World, e: Entity, t: Target, rng: RNG): boolean;
  /** Hounds with a broken collar do not hunt the player until provoked. */
  hostileToPlayer?(e: Entity): boolean;
}

const playerTarget = (w: World): Target => ({ pos: w.player.pos, radius: 0.22 });

/** Doom P_CheckMissileRange: probability of shooting falls with distance (max 200 units). */
export function missileCheck(rng: RNG, d: number, hasMelee: boolean): boolean {
  let u = d * 64 - 64;
  if (!hasMelee) u -= 128;
  u = Math.max(0, Math.min(200, u));
  return rng() * 256 >= u;
}

export function meleeReach(e: Entity, t: Target): number {
  return e.radius + t.radius + C.MELEE_REACH;
}

function hostile(cfg: MonsterCfg, e: Entity): boolean {
  return cfg.hostileToPlayer ? cfg.hostileToPlayer(e) : true;
}

function nearestDemon(w: World, e: Entity, range: number): Entity | undefined {
  let best: Entity | undefined, bd = range;
  for (const o of w.entities) {
    if (o.id === e.id || !alive(o) || !isDemon(o)) continue;
    const d = dist(o.pos, e.pos);
    if (d < bd && canSee(w, e.pos, o.pos)) { bd = d; best = o; }
  }
  return best;
}

function resolveTarget(w: World, e: Entity, cfg: MonsterCfg): Target | null {
  const ent = entityById(w, e.target);
  if (alive(ent) && (num(e, 'thresh') > 0 || !hostile(cfg, e))) return { pos: ent.pos, radius: ent.radius, ent };
  e.target = undefined;
  if (hostile(cfg, e)) return playerTarget(w);
  const d = nearestDemon(w, e, C.HOUND_SIGHT_DEMON);
  if (d) { e.target = d.id; e.data.thresh = C.THRESHOLD; return { pos: d.pos, radius: d.radius, ent: d }; }
  return null;
}

/** Doom A_Look: forward 180 degree sight, or very close behind. */
function sees(w: World, e: Entity, t: Target): boolean {
  const d = dist(e.pos, t.pos);
  if (d > C.SIGHT_RANGE) return false;
  const off = Math.abs(bearing(angleTo(e.pos, t.pos) - e.angle));
  if (!t.ent && off > C.SIGHT_HALF_ARC && d > C.MELEE_BEHIND) return false;
  return t.ent ? canSee(w, e.pos, t.pos) : visible(w, e.pos);
}

export function runMonster(w: World, e: Entity, rng: RNG, cfg: MonsterCfg): void {
  // tells for the read mechanic: deterministic flicker, offset per entity so a crowd is not in sync
  e.data.flicker = e.kind === 'possessed' && e.state !== 'cured' && (w.tic + e.id * 3) % C.FLICKER_PERIOD < C.FLICKER_ON;
  if (e.data.nestX === undefined) { e.data.nestX = e.pos.x; e.data.nestY = e.pos.y; }
  if (e.data.hp === undefined) e.data.hp = e.health;
  // timers
  const dec = (k: string) => { const v = num(e, k); if (v > 0) e.data[k] = v - 1; };
  dec('react'); dec('cool'); dec('thresh');
  // damage from the player (or core hitscan): anything not routed through damageEntity
  const lost = num(e, 'hp') - e.health;
  e.data.hp = e.health;
  if (lost > 0) {
    e.alerted = true;
    e.data.react = 0;
    if (e.kind === 'hound' && !e.collar) e.data.provoked = true;
    if (num(e, 'thresh') <= 0) e.target = undefined;
    if (e.state !== 'stunned') {
      const pc = e.kind === 'hound' ? C.HOUND_PAIN_CHANCE : e.kind === 'ember' ? C.EMBER_PAIN_CHANCE : C.POSS_PAIN_CHANCE;
      if (rng() * 256 < pc) { e.state = 'pain'; e.data.painT = C.PAIN_TICS; }
    }
  }
  if (e.state === 'cured' || e.state === 'dead') return;
  if (e.state === 'stunned') { // mercy sets state + stunT; here we only count down and wake
    const t = num(e, 'stunT') - 1;
    e.data.stunT = Math.max(0, t);
    if (t <= 0) { e.state = 'chase'; e.data.react = C.REACTION_TICS; }
    return;
  }
  if (e.state === 'pain') {
    const t = num(e, 'painT') - 1;
    e.data.painT = t;
    if (t <= 0) { e.state = 'chase'; e.data.windup = 0; }
    return;
  }

  let tgt = resolveTarget(w, e, cfg);
  if (e.state === 'idle') {
    if (!tgt) return;
    if (e.alerted || sees(w, e, tgt)) {
      e.alerted = true;
      e.state = 'chase';
      w.events.push({type:'alert',id:e.id});
      e.data.react = Math.max(num(e, 'react'), C.REACTION_TICS);
    } else {
      return;
    }
  }
  if (!tgt) { e.state = 'idle'; return; }

  const d = dist(e.pos, tgt.pos);
  const want = angleTo(e.pos, tgt.pos);

  if (e.state === 'attack') {
    e.angle = want;
    const left = num(e, 'windup') - 1;
    e.data.windup = left;
    if (left > 0) return;
    if (e.data.atk === 'melee') cfg.doMelee(w, e, tgt, rng);
    else cfg.fireMissile?.(w, e, tgt, rng);
    e.state = 'chase';
    e.data.cool = cfg.recover;
    return;
  }

  // chase / flee
  e.angle = want;
  if (cfg.override && cfg.override(w, e, tgt, rng)) return;
  const sight = canSee(w, e.pos, tgt.pos);
  if (sight && num(e, 'react') <= 0 && num(e, 'cool') <= 0) {
    if (cfg.melee && d <= meleeReach(e, tgt)) { beginAttack(e, cfg, 'melee'); return; }
    if (cfg.missile && e.stateTics % cfg.period === 0 && missileCheck(rng, d, cfg.melee)) { beginAttack(e, cfg, 'missile'); return; }
  }
  if (d > e.radius + tgt.radius + 0.05) chaseStep(w, e, want, cfg.speed);
}

export function beginAttack(e: Entity, cfg: MonsterCfg, kind: 'melee' | 'missile'): void {
  e.state = 'attack';
  e.data.atk = kind;
  e.data.windup = cfg.windup;
}

/** Hit test for a hitscan from `e` at `t` with Doom-style angular error. */
export function hitscan(w: World, e: Entity, t: Target, rng: RNG, spread: number): boolean {
  const aim = angleTo(e.pos, t.pos) + (rng() - rng()) * spread;
  const d = dist(e.pos, t.pos);
  const along = Math.cos(aim) * (t.pos.x - e.pos.x) + Math.sin(aim) * (t.pos.y - e.pos.y);
  const cross = Math.abs(Math.cos(aim) * (t.pos.y - e.pos.y) - Math.sin(aim) * (t.pos.x - e.pos.x));
  w.events.push({ type: 'noise', pos: { ...e.pos } });
  if (along <= 0 || cross >= t.radius || !canSee(w, e.pos, t.pos) || d > 30) return false;
  return true;
}

