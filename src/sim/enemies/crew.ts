import type { EnemyBrain } from '../types';
import { C, alive, angleTo, canSee, dist, isDemon, stepAlong } from './common';
import { bearing } from '../geometry';

/** Uninfected survivors: never attack, run from visible demons, cower when cornered. */
const crew: EnemyBrain = (w, e) => {
  if (e.state === 'dead') return;
  let threat = null as null | { x: number; y: number };
  let best: number = C.CREW_FEAR_RADIUS;
  for (const o of w.entities) {
    if (o === e || !alive(o) || !isDemon(o) || o.state === 'stunned') continue;
    const d = dist(o.pos, e.pos);
    if (d < best && canSee(w, e.pos, o.pos)) { best = d; threat = o.pos; }
  }
  e.data.cower = false;
  if (!threat) { if (e.state === 'flee') e.state = 'idle'; return; }
  const away = bearing(angleTo(e.pos, threat) + Math.PI);
  const ux = Math.cos(away), uy = Math.sin(away);
  // never straight back toward the threat; a step must make real progress away from it
  const tries = [0, Math.PI / 4, -Math.PI / 4, (3 * Math.PI) / 8, (-3 * Math.PI) / 8];
  const side = e.id % 2 ? 1 : -1;
  for (const t of tries) {
    const a = bearing(away + t * side);
    const sx = e.pos.x, sy = e.pos.y;
    stepAlong(w, e, a, C.CREW_SPEED);
    if ((e.pos.x - sx) * ux + (e.pos.y - sy) * uy >= C.CREW_SPEED * 0.3) {
      e.angle = a;
      if (e.state !== 'cured') e.state = 'flee';
      return;
    }
    e.pos.x = sx; e.pos.y = sy;
  }
  e.data.cower = true; // cornered against a wall
  if (e.state !== 'cured') e.state = 'idle';
};
export default crew;
