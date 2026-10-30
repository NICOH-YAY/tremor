import type { EnemyBrain } from '../types';
import { C, alive, angleTo, canSee, chaseStep, damageEntity, dist, hurtPlayer, isDemon, num } from './common';
import { beginAttack, meleeReach, missileCheck, runMonster, type MonsterCfg } from './monster';
import { spawnFireball } from './fireball';

/** Design rule: an ember with no other living demon within 6 tiles kites the player and goes home to its nest. */
const cfg: MonsterCfg = {
  speed: C.EMBER_SPEED, windup: C.EMBER_WINDUP, recover: C.EMBER_RECOVER, period: C.EMBER_PERIOD,
  melee: true, missile: true,
  fireMissile(w, e, t) { spawnFireball(w, e, t.pos); },
  doMelee(w, e, t, rng) {
    if (dist(e.pos, t.pos) > meleeReach(e, t) * 1.3) return;
    const dmg = C.EMBER_CLAW_STEP * (1 + Math.floor(rng() * C.EMBER_CLAW_DIE));
    if (t.ent) damageEntity(w, t.ent, dmg, e, rng); else hurtPlayer(w, dmg);
  },
  override(w, e, t, rng) {
    const alone = !w.entities.some((o) => o !== e && alive(o) && isDemon(o) && dist(o.pos, e.pos) <= C.EMBER_LONELY_RADIUS);
    if (!alone) { if (e.state === 'flee') e.state = 'chase'; return false; }
    const d = dist(e.pos, t.pos);
    if (d <= meleeReach(e, t)) return false; // cornered: claw
    e.state = 'flee';
    const sight = canSee(w, e.pos, t.pos);
    if (sight && num(e, 'react') <= 0 && num(e, 'cool') <= 0 && e.stateTics % C.EMBER_PERIOD === 0 && missileCheck(rng, d, true)) {
      beginAttack(e, cfg, 'missile');
      return true;
    }
    if (sight && d < C.EMBER_FLEE_KEEP + 1) { chaseStep(w, e, angleTo(e.pos, t.pos) + Math.PI, C.EMBER_FLEE_SPEED); return true; }
    if (sight && d <= 9) return true; // hold range and wait for the next shot
    const nest = { x: num(e, 'nestX', e.pos.x), y: num(e, 'nestY', e.pos.y) };
    if (dist(e.pos, nest) > C.EMBER_NEST_REACHED) chaseStep(w, e, angleTo(e.pos, nest), C.EMBER_FLEE_SPEED);
    else { e.state = 'idle'; e.alerted = false; }
    return true;
  },
};
const ember: EnemyBrain = (w, e, rng) => runMonster(w, e, rng, cfg);
export default ember;
