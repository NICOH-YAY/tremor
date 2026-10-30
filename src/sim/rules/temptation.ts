import type { RuleHook } from '../types';

export const TEMPTATION = {
  HEAL_DEMON: 10, // design (DESIGN rule 3)
  HEAL_CREW: 15, // design: the violent path pays more for the people you should not shoot
  MAX_HEALTH: 100, // Doom: MAXHEALTH without bonus items
} as const;

const temptation: RuleHook = {
  name: 'temptation',
  onKill(w, e) {
    if (e.kind === 'fireball' || e.kind === 'pickup') return;
    const amount = e.kind === 'possessed' || e.kind === 'crew' ? TEMPTATION.HEAL_CREW : TEMPTATION.HEAL_DEMON;
    w.player.health = Math.min(TEMPTATION.MAX_HEALTH, w.player.health + amount);
  },
};
export default temptation;
