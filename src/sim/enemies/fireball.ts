import type { Entity, EnemyBrain, RNG, Vec2, World } from '../types';
import { blocked } from '../geometry';
import { C, alive, damageEntity, dist, hurtPlayer, isDemon, num } from './common';

/** Spawn a fireball from `owner` toward `aim`. Entity ids stay unique (max id + 1). */
export function spawnFireball(w: World, owner: Entity, aim: Vec2): Entity {
  // prune long-dead fireballs so the entity array does not grow without bound
  for (let i = w.entities.length - 1; i >= 0; i--) {
    const f = w.entities[i];
    if (f.kind === 'fireball' && f.state === 'dead' && w.tic - num(f, 'diedAt') > C.FIREBALL_CORPSE) w.entities.splice(i, 1);
  }
  const angle = Math.atan2(aim.y - owner.pos.y, aim.x - owner.pos.x);
  let id = 0;
  for (const e of w.entities) id = Math.max(id, e.id);
  const f: Entity = {
    id: id + 1, kind: 'fireball',
    pos: { x: owner.pos.x + Math.cos(angle) * (owner.radius + C.FIREBALL_RADIUS + 0.05), y: owner.pos.y + Math.sin(angle) * (owner.radius + C.FIREBALL_RADIUS + 0.05) },
    angle, radius: C.FIREBALL_RADIUS, health: 1, state: 'chase', stateTics: 0, alerted: true,
    readProgress: 0, revealed: true, data: { owner: owner.id, ownerKind: owner.kind, born: w.tic, hp: 1 },
  };
  w.entities.push(f);
  w.events.push({type:'fireball',id:f.id});
  return f;
}

function explode(w: World, f: Entity): void {
  f.health = 0;
  f.state = 'dead';
  f.data.diedAt = w.tic;
  w.events.push({type:'explosion',id:f.id});
  w.events.push({ type: 'noise', pos: { ...f.pos } });
}

/** Fireball brain: advance in sub-steps; explode on wall, player or entity (never its own kind of owner). */
const fireball: EnemyBrain = (w: World, f: Entity, rng: RNG) => {
  if (f.data.born === w.tic) return; // spawned this tic, starts moving next tic
  if (w.tic - num(f, 'born') > C.FIREBALL_LIFE) { explode(w, f); return; }
  const owner = w.entities.find((e) => e.id === num(f, 'owner'));
  const steps = Math.ceil(C.FIREBALL_SPEED / 0.08);
  const dx = (Math.cos(f.angle) * C.FIREBALL_SPEED) / steps, dy = (Math.sin(f.angle) * C.FIREBALL_SPEED) / steps;
  for (let i = 0; i < steps; i++) {
    f.pos.x += dx; f.pos.y += dy;
    if (blocked(w, Math.floor(f.pos.x), Math.floor(f.pos.y))) { explode(w, f); return; }
    const damage = () => C.FIREBALL_DAMAGE_STEP * (1 + Math.floor(rng() * C.FIREBALL_DAMAGE_DIE));
    if (dist(f.pos, w.player.pos) < 0.22 + f.radius) { hurtPlayer(w, damage()); explode(w, f); return; }
    for (const e of w.entities) {
      if (e === f || e.id === num(f, 'owner') || !alive(e) || e.kind === 'pickup' || e.kind === 'fireball') continue;
      if (dist(f.pos, e.pos) >= e.radius + f.radius) continue;
      // Doom PIT_CheckThing: a missile never harms its own species; it just bursts
      if (!(isDemon(e) && e.kind === f.data.ownerKind)) damageEntity(w, e, damage(), owner, rng);
      explode(w, f);
      return;
    }
  }
};
export default fireball;
