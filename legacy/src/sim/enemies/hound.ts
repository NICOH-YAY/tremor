import type { EnemyBrain } from '../types';
import { C, damageEntity, dist, hurtPlayer } from './common';
import { meleeReach, runMonster, type MonsterCfg } from './monster';

/** A collared hound hunts the player; a freed one fights demons and ignores the player unless attacked. */
const cfg: MonsterCfg = {
  speed: C.HOUND_SPEED, windup: C.HOUND_WINDUP, recover: C.HOUND_RECOVER, period: C.HOUND_PERIOD,
  melee: true, missile: false,
  hostileToPlayer: (e) => !!e.collar || e.data.provoked === true,
  doMelee(w, e, t, rng) {
    if (dist(e.pos, t.pos) > meleeReach(e, t) * 1.3) return;
    const dmg = C.HOUND_BITE_STEP * (1 + Math.floor(rng() * C.HOUND_BITE_DIE));
    if (t.ent) damageEntity(w, t.ent, dmg, e, rng); else hurtPlayer(w, dmg);
  },
};
const hound: EnemyBrain = (w, e, rng) => runMonster(w, e, rng, cfg);
export default hound;
