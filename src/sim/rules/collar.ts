import type { RuleHook } from '../types';
import { worldRng } from '../rng';
import { C } from '../enemies/common';

/**
 * Design rule: a shot aimed at a collared hound's head centre may break the collar instead of
 * hurting it. onFire runs before core damage (40), so a break refunds that damage; the core
 * `hit` event is still emitted and a zero-amount `hit` marks the break for audio/render.
 */
const collar: RuleHook = {
  name: 'collar',
  onFire(w, hitId) {
    if (hitId === null) return;
    const e = w.entities.find((x) => x.id === hitId);
    if (!e || e.kind !== 'hound' || !e.collar || e.health <= 0) return;
    const p = w.player;
    const dx = e.pos.x - p.pos.x, dy = e.pos.y - p.pos.y;
    const cross = Math.abs(dx * Math.sin(p.angle) - dy * Math.cos(p.angle));
    if (cross > e.radius * C.COLLAR_CONE) return;
    if (worldRng(w)() >= C.COLLAR_BREAK_CHANCE) return;
    e.collar = false;
    e.health += 40; // refund the core hitscan damage applied right after this hook
    e.data.collarBroken = true;
    e.alerted = true;
    w.events.push({ type: 'hit', id: e.id, amount: 0 });
  },
};
export default collar;
