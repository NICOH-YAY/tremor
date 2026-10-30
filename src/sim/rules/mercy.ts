import type { Entity, RuleHook, World } from '../types';
import { worldRng } from '../rng';
import { alive, dist, isDemon, num } from '../enemies/common';

export const MERCY = {
  STUN_RANGE: 2.5, // design (tiles)
  STUN_TICS: 70, // design
  STUN_COOLDOWN: 20, // design: weapon cooldown set by a stun, so it cannot be held down
  PURGE_RANGE: 1.5, // design (tiles)
  PURGE_TICS: 35, // design
  PURGE_SLOW: 0.4, // design: player velocity multiplier each tic while purging
  RELAPSE_AFTER: 600, // design (tics after cure)
  RELAPSE_CHANCE: 0.15, // design
  HELPER_CHANCE: 0.5, // design: chance a cured crew becomes a helper
  WARN_RANGE: 8, // design: tiles from the helper to an unaware demon
  WARN_TEXT: 'A survivor warns you of movement ahead.',
} as const;

function purging(w: World): Entity | undefined {
  return w.entities.find((e) => num(e, 'purgeT') > 0);
}

function startStun(w: World, e: Entity): void {
  e.state = 'stunned';
  e.data.stunT = MERCY.STUN_TICS;
  e.data.windup = 0;
  w.player.weaponCooldown = Math.max(w.player.weaponCooldown, MERCY.STUN_COOLDOWN);
}

function cure(w: World, e: Entity, rng: () => number): void {
  e.kind = 'crew';
  e.state = 'cured';
  e.revealed = true;
  e.alerted = false;
  e.target = undefined;
  e.health = Math.max(e.health, 20);
  e.data.purgeT = 0;
  e.data.stunT = 0;
  e.data.curedAt = w.tic;
  e.data.helper = rng() < MERCY.HELPER_CHANCE;
  w.player.saved++;
  w.events.push({ type: 'cured', id: e.id });
}

const mercy: RuleHook = {
  name: 'mercy',
  onTic(w) {
    const p = w.player, rng = worldRng(w);
    // 1. stun
    for (const e of w.entities) {
      if (e.data.stunRequested !== true || !alive(e) || e.kind !== 'possessed' || e.state === 'stunned') continue;
      if (p.weaponCooldown > 0 || dist(e.pos, p.pos) > MERCY.STUN_RANGE) continue;
      startStun(w, e);
      w.events.push({type:'stun',id:e.id});
    }
    // 2. purge: only one at a time; charge is spent when it starts
    if (!purging(w)) {
      for (const e of w.entities) {
        if (e.data.purgeRequested !== true || !alive(e) || e.kind !== 'possessed' || e.state !== 'stunned') continue;
        if (p.purgeCharges <= 0 || dist(e.pos, p.pos) > MERCY.PURGE_RANGE) continue;
        p.purgeCharges--;
        e.data.purgeT = MERCY.PURGE_TICS;
        e.data.purgeHp = p.health;
        break;
      }
    }
    const e = purging(w);
    if (e) {
      const interrupted = p.health < num(e, 'purgeHp') || !alive(e) || dist(e.pos, p.pos) > MERCY.PURGE_RANGE + 0.5;
      if (interrupted) {
        e.data.purgeT = 0; // charge stays spent
      } else {
        p.vel.x *= MERCY.PURGE_SLOW; p.vel.y *= MERCY.PURGE_SLOW;
        e.data.stunT = Math.max(num(e, 'stunT'), 3); // do not wake mid-purge
        e.data.purgeT = num(e, 'purgeT') - 1;
        if (e.data.purgeT <= 0) cure(w, e, rng);
      }
    }
    // 3. cured crew: seeded relapse and helping
    for (const c of w.entities) {
      if (c.kind !== 'crew' || c.state !== 'cured' || !alive(c)) continue;
      const age = w.tic - num(c, 'curedAt', w.tic);
      if (age === MERCY.RELAPSE_AFTER && rng() < MERCY.RELAPSE_CHANCE) {
        c.kind = 'possessed'; c.state = 'chase'; c.alerted = true; c.data.relapsed = true; continue;
      }
      if (c.data.helper === true && c.data.warned !== true) {
        const threat = w.entities.find((o) => alive(o) && isDemon(o) && !o.alerted && dist(o.pos, c.pos) <= MERCY.WARN_RANGE);
        if (threat) { c.data.warned = true; w.events.push({ type: 'radio', text: MERCY.WARN_TEXT }); }
      }
    }
  },
};
export default mercy;
