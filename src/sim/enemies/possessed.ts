import type { EnemyBrain } from '../types';
import { C, damageEntity, hurtPlayer } from './common';
import { hitscan, runMonster, type MonsterCfg } from './monster';

const cfg: MonsterCfg = {
  speed: C.POSS_SPEED, windup: C.POSS_WINDUP, recover: C.POSS_RECOVER, period: C.POSS_PERIOD,
  melee: false, missile: true,
  fireMissile(w, e, t, rng) {
    if (!hitscan(w, e, t, rng, C.POSS_SPREAD)) return;
    const dmg = C.POSS_DAMAGE_STEP * (1 + Math.floor(rng() * C.POSS_DAMAGE_DIE));
    if (t.ent) damageEntity(w, t.ent, dmg, e, rng); else hurtPlayer(w, dmg);
  },
  doMelee() {},
};
const possessed: EnemyBrain = (w, e, rng) => runMonster(w, e, rng, cfg);
export default possessed;
