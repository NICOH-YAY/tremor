import type { RuleHook } from '../types';

export const TRAUMA = {
  PER_CREW_KILL: 1, // design (DESIGN rule 2)
  CAP: 6, // design
} as const;

/**
 * Killing crew or a possessed adds permanent tremor; demons add none. world.ts already widens
 * the player's firing spread by `tremor`; nothing else is shown (no meter, no message).
 */
const trauma: RuleHook = {
  name: 'trauma',
  onKill(w, e) {
    if (e.kind === 'possessed' || e.kind === 'crew') w.player.tremor = Math.min(TRAUMA.CAP, w.player.tremor + TRAUMA.PER_CREW_KILL);
  },
};
export default trauma;
