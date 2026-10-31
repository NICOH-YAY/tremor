import type { RuleHook, World } from '../types';
import { visible } from '../geometry';

/** Rule constants. "design" = our own rule, see docs/DESIGN.md rule 1. */
export const RECOGNITION = {
  REVEAL_AT: 35, // design: ~1 s at 35 Hz
  RANGE: 10, // design: tiles
  CLOSE_RANGE: 3, // design: tiles inside which reading is 1.5x faster
  CLOSE_BONUS: 1.5, // design
  DECAY: 0.25, // design: progress lost per tic when not read
} as const;

/** Brightness 0..1 of the cell holding a point; map.light is optional (values >1 treated as 0..255). */
function brightness(w: World, x: number, y: number): number {
  const l = w.map.light;
  if (!l) return 1;
  const v = l[Math.floor(y) * w.map.width + Math.floor(x)];
  if (v === undefined) return 1;
  return Math.max(0, Math.min(1, v > 1 ? v / 255 : v));
}

const recognition: RuleHook = {
  name: 'recognition',
  onTic(w) {
    for (const e of w.entities) {
      if (e.health <= 0 || e.kind === 'pickup' || e.kind === 'fireball' || e.revealed) continue;
      const d = Math.hypot(e.pos.x - w.player.pos.x, e.pos.y - w.player.pos.y);
      if (e.data.reading === true && d <= RECOGNITION.RANGE && visible(w, e.pos)) {
        // faster when closer and when the target stands in light (dark halves nothing: floor 0.5)
        const rate = (0.5 + 0.5 * brightness(w, e.pos.x, e.pos.y)) * (d <= RECOGNITION.CLOSE_RANGE ? RECOGNITION.CLOSE_BONUS : 1);
        e.readProgress += rate;
        if (e.readProgress >= RECOGNITION.REVEAL_AT) { e.readProgress = RECOGNITION.REVEAL_AT; e.revealed = true; }
      } else if (e.readProgress > 0) {
        e.readProgress = Math.max(0, e.readProgress - RECOGNITION.DECAY);
      }
    }
  },
};
export default recognition;
