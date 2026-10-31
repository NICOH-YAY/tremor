/**
 * Shared helpers and the constants table for enemy behaviour.
 * Unit conversion: 1 tile = 64 Doom map units (U = 1/64 tile). A tic is 1/35 s.
 * Every constant names its Doom source (linuxdoom-1.10, see docs/research/doom-rules.md) or "design".
 */
import type { Entity, EntityKind, RNG, Vec2, World } from '../types';
import { bearing, moveCircle, rayDistance } from '../geometry';

const U = 1 / 64;

export const C = {
  // --- possessed (zombieman role)
  POSS_SPEED: 2 * U, // Doom: speed 8 units per 4-tic run frame = 2 units/tic
  POSS_PAIN_CHANCE: 200, // Doom: mobjinfo painchance 200/256
  POSS_WINDUP: 10, // Doom: S_POSS_ATK1 10 tics before the shot
  POSS_RECOVER: 22, // Doom: ATK2/ATK3 (8+8) plus the JUSTATTACKED pause
  POSS_PERIOD: 4, // Doom: A_Chase runs every 4 tics in run frames
  POSS_SPREAD: 0.38, // Doom: (P_Random()-P_Random())<<20, about +/-22 degrees
  POSS_DAMAGE_STEP: 3, // Doom: A_PosAttack 3*(P_Random()%5+1)
  POSS_DAMAGE_DIE: 5,
  // --- ember (imp role)
  EMBER_SPEED: 2.7 * U, // Doom: 8 units per 3-tic run frame
  EMBER_PAIN_CHANCE: 200, // Doom
  EMBER_WINDUP: 16, // Doom: S_TROO_ATK1/2 8+8 tics
  EMBER_RECOVER: 30, // design
  EMBER_PERIOD: 3, // Doom: 3-tic run frames
  EMBER_CLAW_STEP: 3, // Doom: A_TroopAttack 3*(P_Random()%8+1)
  EMBER_CLAW_DIE: 8,
  EMBER_LONELY_RADIUS: 6, // design: flee when no other living demon within 6 tiles
  EMBER_FLEE_KEEP: 5, // design: kiting distance kept while alone
  EMBER_FLEE_SPEED: 3.2 * U, // design: a little faster when scared
  EMBER_NEST_REACHED: 0.4, // design
  FIREBALL_SPEED: 0.11, // design: Doom 10 units/tic (0.156 tile), slowed so it is dodgeable without pitch
  FIREBALL_RADIUS: 0.12, // Doom: MT_TROOPSHOT radius 6 units, rounded up
  FIREBALL_DAMAGE_STEP: 3, // Doom: PIT_CheckThing 3*(P_Random()%8+1)
  FIREBALL_DAMAGE_DIE: 8,
  FIREBALL_LIFE: 200, // design: despawn safety net
  FIREBALL_CORPSE: 8, // design: tics a dead fireball lingers as an explosion
  // --- hound (pinky role)
  HOUND_SPEED: 5 * U, // Doom: 10 units per 2-tic run frame
  HOUND_PAIN_CHANCE: 180, // Doom
  HOUND_WINDUP: 16, // Doom: S_SARG_ATK1/2 8+8
  HOUND_RECOVER: 14, // design
  HOUND_PERIOD: 2, // Doom: 2-tic run frames
  HOUND_BITE_STEP: 4, // Doom: A_SargAttack 4*(P_Random()%10+1)
  HOUND_BITE_DIE: 10,
  COLLAR_BREAK_CHANCE: 0.4, // design
  COLLAR_CONE: 0.45, // design: fraction of body radius counted as the head-centre aim window
  HOUND_SIGHT_DEMON: 14, // design: range at which a collarless hound picks a demon to fight
  // --- crew
  CREW_SPEED: 2.5 * U, // design
  CREW_FEAR_RADIUS: 8, // design: a visible demon this close sends crew running
  // --- shared
  REACTION_TICS: 12, // Doom: reactiontime 8 chase calls (about 32 tics); shortened for playability
  SIGHT_RANGE: 20, // design (Doom: unlimited within line of sight)
  SIGHT_HALF_ARC: Math.PI / 2, // Doom: P_LookForPlayers ignores the rear 180 degrees
  MELEE_BEHIND: 1.0, // Doom: MELEERANGE 64 units wakes a monster even behind it
  MELEE_REACH: 0.45, // design: added to both radii (Doom: 64 units minus 20 plus target radius)
  THRESHOLD: 100, // Doom: BASETHRESHOLD, infighting stickiness in tics
  PAIN_TICS: 6, // Doom: S_POSS_PAIN 3+3
  ARMOR_ABSORB: 1 / 3, // Doom: green armor absorbs 1/3 of damage
  FLICKER_PERIOD: 14, // design: tell cadence for the read mechanic
  FLICKER_ON: 2,
} as const;

export function num(e: Entity, k: string, d = 0): number {
  const v = e.data[k];
  return typeof v === 'number' ? v : d;
}
export function flag(e: Entity, k: string): boolean {
  return e.data[k] === true;
}
export function isDemon(e: Entity): boolean {
  return e.kind === 'possessed' || e.kind === 'ember' || e.kind === 'hound';
}
export function alive(e: Entity | undefined): e is Entity {
  return !!e && e.health > 0 && e.state !== 'dead';
}
export function entityById(w: World, id: number | undefined): Entity | undefined {
  return id === undefined ? undefined : w.entities.find((e) => e.id === id);
}
export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
export function angleTo(a: Vec2, b: Vec2): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}
/** Wall/door line of sight between two points. */
export function canSee(w: World, a: Vec2, b: Vec2): boolean {
  const d = dist(a, b);
  if (d < 1e-6) return true;
  return rayDistance(w, a, angleTo(a, b), d) >= d - 0.05;
}
/** Doom's bell-shaped error: P_Random() - P_Random() scaled to [-1,1). */
export function triangular(rng: RNG): number {
  return rng() - rng();
}

/** Reduce armor then health, emit playerHurt. The world core ends the level when health <= 0. */
export function hurtPlayer(w: World, amount: number): void {
  if (amount <= 0 || w.done || w.player.health <= 0) return;
  const p = w.player;
  const saved = Math.min(p.armor, Math.floor(amount * C.ARMOR_ABSORB)); // Doom P_DamageMobj armor split
  p.armor -= saved;
  const lost = amount - saved;
  p.health = Math.max(0, p.health - lost);
  w.events.push({ type: 'playerHurt', amount: lost });
}

/**
 * Damage an entity from a non-player source. Updates the hp watermark so the brain does not
 * mistake it for player damage, applies the Doom pain roll and the infighting retarget.
 * Monster-on-monster kills emit `kill` but never touch player counters or onKill hooks.
 */
export function damageEntity(w: World, victim: Entity, amount: number, attacker: Entity | undefined, rng: RNG): void {
  if (!alive(victim) || amount <= 0) return;
  victim.health -= amount;
  victim.data.hp = victim.health;
  w.events.push({ type: 'hit', id: victim.id, amount });
  if (victim.health <= 0) {
    victim.health = 0;
    victim.state = 'dead';
    const wasCrew = victim.kind === 'possessed' || victim.kind === 'crew';
    w.events.push({ type: 'kill', id: victim.id, kind: victim.kind as EntityKind, wasCrew });
    return;
  }
  if (!isDemon(victim)) return;
  // Doom P_DamageMobj: retarget the attacker unless same species; reaction time cleared.
  if (attacker && attacker.id !== victim.id && attacker.kind !== victim.kind && isDemon(attacker)) {
    victim.target = attacker.id;
    victim.data.thresh = C.THRESHOLD;
    victim.alerted = true;
    victim.data.react = 0;
  }
  if (victim.state !== 'stunned') {
    const chance =
      victim.kind === 'hound' ? C.HOUND_PAIN_CHANCE : victim.kind === 'ember' ? C.EMBER_PAIN_CHANCE : C.POSS_PAIN_CHANCE;
    if (rng() * 256 < chance) {
      victim.state = 'pain';
      victim.data.painT = C.PAIN_TICS;
    } else if (victim.state === 'idle') {
      victim.state = 'chase';
    }
  }
}

/** Open a plain (unkeyed, unsealed) door in the tile ahead, as Doom monsters open doors they bump. */
export function tryOpenDoorAhead(w: World, e: Entity, angle: number): void {
  const px = e.pos.x + Math.cos(angle) * (e.radius + 0.3);
  const py = e.pos.y + Math.sin(angle) * (e.radius + 0.3);
  const d = w.map.doors.find((dd) => dd.x === Math.floor(px) && dd.y === Math.floor(py));
  if (d && d.state === 'closed' && !d.key && !d.sealed) {
    d.state = 'opening';
    w.events.push({ type: 'door', x: d.x, y: d.y, state: d.state });
  }
}

/** Move up to `speed` along `angle`; returns the distance actually travelled. */
export function stepAlong(w: World, e: Entity, angle: number, speed: number): number {
  const sx = e.pos.x, sy = e.pos.y;
  tryOpenDoorAhead(w, e, angle);
  moveCircle(w, e.pos, Math.cos(angle) * speed, Math.sin(angle) * speed, e.radius);
  return Math.hypot(e.pos.x - sx, e.pos.y - sy);
}

/**
 * Doom-like direction choice (P_NewChaseDir, simplified): try straight at the goal, then the two
 * perpendiculars (sticky side so it does not dither), then diagonals. Returns true if it moved.
 */
export function chaseStep(w: World, e: Entity, goal: number, speed: number): boolean {
  const side = num(e, 'side', 1) >= 0 ? 1 : -1;
  const q = Math.PI / 2;
  const tries = [0, side * q, -side * q, (side * q) / 2, (-side * q) / 2, side * 1.5 * q];
  for (let i = 0; i < tries.length; i++) {
    const a = bearing(goal + tries[i]);
    if (stepAlong(w, e, a, speed) >= speed * 0.4) {
      if (i === 2) e.data.side = -side;
      e.angle = a;
      return true;
    }
  }
  e.data.side = -side;
  return false;
}
