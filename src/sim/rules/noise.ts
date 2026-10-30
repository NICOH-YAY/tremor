import type { RuleHook, World } from '../types';
import { blocked } from '../geometry';

export const NOISE = {
  RADIUS: 12, // design: tiles (Doom floods all connected sectors; distance cap is ours)
} as const;

/**
 * Doom P_NoiseAlert / P_RecursiveSound simplified: flood from the player through non-blocking
 * cells (closed doors block, open doors pass) and mark every reachable monster within RADIUS.
 */
export function propagateNoise(w: World): number {
  const m = w.map, R = NOISE.RADIUS;
  const sx = Math.floor(w.player.pos.x), sy = Math.floor(w.player.pos.y);
  const depth = new Int16Array(m.width * m.height).fill(-1);
  const queue: number[] = [];
  if (sx < 0 || sy < 0 || sx >= m.width || sy >= m.height) return 0;
  depth[sy * m.width + sx] = 0;
  queue.push(sx, sy);
  for (let i = 0; i < queue.length; i += 2) {
    const x = queue[i], y = queue[i + 1], dd = depth[y * m.width + x];
    if (dd >= R) continue;
    for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
      if (!ox && !oy) continue;
      const nx = x + ox, ny = y + oy;
      if (blocked(w, nx, ny) || depth[ny * m.width + nx] >= 0) continue;
      if (ox && oy && (blocked(w, x + ox, y) || blocked(w, x, y + oy))) continue; // no corner cutting
      depth[ny * m.width + nx] = dd + 1;
      queue.push(nx, ny);
    }
  }
  let n = 0;
  for (const e of w.entities) {
    if (e.health <= 0 || (e.kind !== 'possessed' && e.kind !== 'ember' && e.kind !== 'hound')) continue;
    const cx = Math.floor(e.pos.x), cy = Math.floor(e.pos.y);
    if (cx < 0 || cy < 0 || cx >= m.width || cy >= m.height) continue;
    if (depth[cy * m.width + cx] < 0) continue;
    if (Math.hypot(e.pos.x - w.player.pos.x, e.pos.y - w.player.pos.y) > R) continue;
    if (!e.alerted) { e.alerted = true; n++; }
  }
  return n;
}

const noise: RuleHook = {
  name: 'noise',
  onFire(w) { propagateNoise(w); },
};
export default noise;
