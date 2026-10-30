import { describe, it, expect } from 'vitest';
import { createWorld, idleCmd, tick } from '../world';
import type { EntitySpawn, LevelDef, World, Entity, InputCmd } from '../types';
import { spawnFireball } from '../enemies/fireball';

/** Build an open W x H room (walls on the border). `walls` adds extra wall cells as "x,y". */
function room(w: number, h: number, ents: EntitySpawn[], opts: { walls?: string[]; doors?: { x: number; y: number }[]; spawn?: [number, number] } = {}): LevelDef {
  const cells = new Array(w * h).fill(0);
  for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (x === 0 || y === 0 || x === w - 1 || y === h - 1) cells[y * w + x] = 1;
  for (const s of opts.walls ?? []) { const [x, y] = s.split(',').map(Number); cells[y * w + x] = 1; }
  const sp = opts.spawn ?? [2.5, 4.5];
  return {
    id: 't', title: 't', endText: () => '',
    map: { width: w, height: h, cells, doors: (opts.doors ?? []).map((d) => ({ x: d.x, y: d.y, openAmount: 0, state: 'closed' as const })), spawns: [{ x: sp[0], y: sp[1] }], keys: [], exit: { x: w - 1.5, y: 1.5 }, triggers: [] },
    entities: ents,
  };
}
const cmd = (o: Partial<InputCmd> = {}): InputCmd => ({ ...idleCmd(), ...o });
const run = (w: World, n: number, c: Partial<InputCmd> = {}) => { for (let i = 0; i < n; i++) tick(w, cmd(c)); };
const ent = (w: World, i = 0): Entity => w.entities[i];
/** An entity `dx` tiles east of the player (2.5,4.5), facing the player. */
const ahead = (dx: number, kind: EntitySpawn['kind'] = 'possessed', extra: Partial<EntitySpawn> = {}): EntitySpawn => ({ kind, pos: { x: 2.5 + dx, y: 4.5 }, angle: Math.PI, ...extra });
/** A world with the player at (2.5,4.5) facing east, open 14x9 room. */
const mk = (ents: EntitySpawn[], seed = 1, opts = {}) => createWorld(room(14, 9, ents, opts), seed);

describe('recognition', () => {
  it('reveals a read target after about 35 tics and persists', () => {
    const w = mk([ahead(4, 'crew')]);
    let t = 0;
    while (!ent(w).revealed && t < 80) { tick(w, cmd({ read: true })); t++; }
    expect(t).toBeGreaterThanOrEqual(34); expect(t).toBeLessThanOrEqual(38);
    expect(w.player.reads).toBe(1);
    run(w, 40);
    expect(ent(w).revealed).toBe(true);
  });
  it('decays slowly when not read and does not reveal if interrupted', () => {
    const w = mk([ahead(4, 'crew')]);
    run(w, 20, { read: true });
    const p = ent(w).readProgress;
    expect(p).toBeGreaterThan(15);
    run(w, 10);
    expect(ent(w).readProgress).toBeLessThan(p); expect(ent(w).readProgress).toBeGreaterThan(p - 5);
    expect(ent(w).revealed).toBe(false);
  });
  it('reads faster up close', () => {
    const far = mk([ahead(6, 'crew')]), near = mk([ahead(2, 'crew')]);
    run(far, 20, { read: true }); run(near, 20, { read: true });
    expect(ent(near).readProgress).toBeGreaterThan(ent(far).readProgress);
  });
});

describe('trauma and temptation', () => {
  it('killing crew raises tremor; killing a demon does not', () => {
    const w = mk([ahead(3, 'crew')]);
    tick(w, cmd({ fire: true }));
    expect(ent(w).state).toBe('dead'); expect(w.player.tremor).toBe(1);
    const d = mk([ahead(3, 'ember')]);
    tick(d, cmd({ fire: true }));
    expect(ent(d).state).toBe('dead'); expect(d.player.tremor).toBe(0);
    expect(d.player.kills.demons).toBe(1);
  });
  it('caps tremor at 6', () => {
    const w = mk([ahead(3, 'possessed')]);
    w.player.tremor = 6;
    tick(w, cmd({ fire: true }));
    expect(w.player.tremor).toBe(6);
  });
  it('kills heal: 10 for demons, 15 for crew, capped at 100', () => {
    const a = mk([ahead(3, 'hound')]); a.player.health = 50;
    tick(a, cmd({ fire: true })); expect(a.player.health).toBe(60);
    const b = mk([ahead(3, 'crew')]); b.player.health = 50;
    tick(b, cmd({ fire: true })); expect(b.player.health).toBe(65);
    const c = mk([ahead(3, 'ember')]); c.player.health = 95;
    tick(c, cmd({ fire: true })); expect(c.player.health).toBe(100);
  });
});

describe('mercy', () => {
  const setup = (seed = 1) => mk([ahead(1.2)], seed);
  it('stun then purge cures, increments saved and consumes a charge', () => {
    const w = setup();
    tick(w, cmd({ stun: true }));
    expect(ent(w).state).toBe('stunned');
    let cured = false;
    for (let i = 0; i < 45 && !cured; i++) { tick(w, cmd({ purge: true })); cured = w.events.some((e) => e.type === 'cured'); }
    expect(cured).toBe(true);
    expect(ent(w).kind).toBe('crew'); expect(ent(w).state).toBe('cured');
    expect(w.player.saved).toBe(1); expect(w.player.purgeCharges).toBe(2);
  });
  it('purge without a charge does nothing', () => {
    const w = setup(); w.player.purgeCharges = 0;
    tick(w, cmd({ stun: true })); run(w, 45, { purge: true });
    expect(ent(w).kind).toBe('possessed'); expect(w.player.saved).toBe(0);
  });
  it('purge needs a stunned target', () => {
    const w = setup();
    run(w, 3, { purge: true });
    expect(w.player.purgeCharges).toBe(3); expect(ent(w).kind).toBe('possessed');
  });
  it('stun fails out of range', () => {
    const w = mk([ahead(4)]);
    tick(w, cmd({ stun: true }));
    expect(ent(w).state).not.toBe('stunned');
  });
  it('purge is interrupted when the player takes damage', () => {
    const w = setup();
    tick(w, cmd({ stun: true }));
    run(w, 10, { purge: true });
    w.player.health -= 5;
    tick(w, cmd({ purge: true }));
    run(w, 40); // button released: the interrupted purge does not restart
    expect(w.player.purgeCharges).toBe(2); // the interrupted charge stays spent
    expect(ent(w).kind).toBe('possessed'); expect(w.player.saved).toBe(0);
  });
  it('a stunned possessed does nothing for 70 tics, then wakes', () => {
    const w = setup();
    tick(w, cmd({ stun: true }));
    const hp = w.player.health, x = ent(w).pos.x;
    run(w, 60);
    expect(w.player.health).toBe(hp); expect(ent(w).pos.x).toBe(x); expect(ent(w).state).toBe('stunned');
    run(w, 15);
    expect(ent(w).state).not.toBe('stunned');
  });
  it('cured crew can relapse (seeded) and help (radio warning)', () => {
    let relapsed = 0, cured = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const w = setup(seed);
      tick(w, cmd({ stun: true })); run(w, 40, { purge: true });
      if (ent(w).kind !== 'crew') continue;
      cured++;
      w.player.pos = { x: 11, y: 7 };
      ent(w).pos = { x: 3, y: 4 };
      run(w, 640);
      if (ent(w).kind === 'possessed') relapsed++;
    }
    expect(cured).toBe(40);
    expect(relapsed).toBeGreaterThan(0); expect(relapsed).toBeLessThan(20);
    let warned = false;
    for (let seed = 1; seed <= 20 && !warned; seed++) {
      const w = mk([ahead(1.2), { kind: 'ember', pos: { x: 9, y: 7 }, angle: 0 }], seed);
      ent(w, 1).health = 1000;
      tick(w, cmd({ stun: true })); run(w, 40, { purge: true });
      if (ent(w).kind !== 'crew') continue;
      run(w, 10);
      if (w.log.some((e) => e.type === 'radio' && /warns you/.test(e.text))) warned = true;
    }
    expect(warned).toBe(true);
  });
});

describe('noise', () => {
  it('alerts only monsters with a connected open path within 12 tiles', () => {
    const lvl = room(30, 9, [
      { kind: 'possessed', pos: { x: 8.5, y: 4.5 }, angle: 0 }, // beyond the door, facing away
      { kind: 'possessed', pos: { x: 20.5, y: 4.5 }, angle: 0 }, // too far
      { kind: 'possessed', pos: { x: 8.5, y: 6.5 }, angle: 0 },
    ], { walls: ['6,1', '6,2', '6,3', '6,5', '6,6', '6,7'], doors: [{ x: 6, y: 4 }] });
    const w = createWorld(lvl, 3);
    tick(w, cmd({ fire: true }));
    expect(w.entities.map((e) => e.alerted)).toEqual([false, false, false]);
    w.map.doors[0].openAmount = 1; w.map.doors[0].state = 'open';
    w.player.weaponCooldown = 0;
    tick(w, cmd({ fire: true }));
    expect(w.entities.map((e) => e.alerted)).toEqual([true, false, true]);
  });
});

describe('possessed', () => {
  it('idle until it sees the player, ignores the player behind it', () => {
    const w = mk([{ kind: 'possessed', pos: { x: 9, y: 4.5 }, angle: 0 }]);
    run(w, 30);
    expect(ent(w).state).toBe('idle');
    const v = mk([{ kind: 'possessed', pos: { x: 9, y: 4.5 }, angle: Math.PI }]);
    run(v, 3);
    expect(['chase', 'attack']).toContain(ent(v).state);
  });
  it('chases and shoots the player with hitscan, armor absorbs part', () => {
    let hurt = false;
    for (let seed = 1; seed <= 10 && !hurt; seed++) {
      const w = mk([ahead(3)], seed); w.player.armor = 50;
      run(w, 300);
      if (w.player.health < 100) { hurt = true; expect(w.player.armor).toBeLessThan(50); }
    }
    expect(hurt).toBe(true);
  });
  it('emits playerHurt and player death sets outcome dead', () => {
    const w = mk([ahead(1.5, 'hound', { collar: true, health: 150 })]); w.player.health = 5;
    run(w, 200);
    expect(w.done).toBe(true); expect(w.outcome).toBe('dead');
    expect(w.log.some((e) => e.type === 'playerHurt')).toBe(true);
  });
  it('flicker tell toggles deterministically; crew never flicker', () => {
    const w = mk([ahead(8)]);
    const seen = new Set<boolean>();
    for (let i = 0; i < 30; i++) { tick(w, cmd()); seen.add(ent(w).data.flicker === true); }
    expect(seen.size).toBe(2);
    const c = mk([ahead(8, 'crew')]); run(c, 30);
    expect(ent(c).data.flicker).not.toBe(true);
  });
  it('goes into pain when hit and survives', () => {
    let pained = false;
    for (let seed = 1; seed <= 20; seed++) {
      const w = mk([ahead(4, 'possessed', { health: 200 })], seed);
      tick(w, cmd()); // let the brain record its health watermark
      tick(w, cmd({ fire: true }));
      if (ent(w).state === 'pain') pained = true;
    }
    expect(pained).toBe(true);
  });
});

describe('crew', () => {
  it('never attacks, flees from a visible demon and counts as crew when killed', () => {
    const w = mk([{ kind: 'crew', pos: { x: 6, y: 4.5 } }, { kind: 'ember', pos: { x: 4, y: 4.5 }, angle: 0, health: 1000 }]);
    const x0 = ent(w).pos.x;
    run(w, 30);
    expect(ent(w).pos.x).toBeGreaterThan(x0 + 0.5);
    expect(ent(w).state).toBe('flee');
    const c = mk([ahead(3, 'crew')]);
    tick(c, cmd({ fire: true }));
    expect(c.player.kills.crew).toBe(1);
  });
  it('cowers when cornered and never hurts the player', () => {
    const w = mk([{ kind: 'crew', pos: { x: 12.5, y: 1.5 } }, { kind: 'ember', pos: { x: 9.5, y: 1.5 }, angle: 0, health: 1000 }], 1, { walls: ['9,2', '10,2', '11,2', '12,2'] });
    w.player.pos = { x: 1.5, y: 7.5 };
    run(w, 150);
    expect(ent(w).data.cower).toBe(true);
    expect(w.player.health).toBe(100);
  });
});

describe('ember and fireball', () => {
  it('a fireball damages the player', () => {
    const w = mk([{ kind: 'ember', pos: { x: 7, y: 4.5 }, angle: Math.PI }]);
    spawnFireball(w, ent(w), w.player.pos);
    let hurt = false;
    for (let i = 0; i < 80 && !hurt; i++) { tick(w, cmd()); hurt = w.events.some((e) => e.type === 'playerHurt'); }
    expect(hurt).toBe(true);
    expect(w.player.health).toBeLessThan(100);
    expect(w.entities.find((e) => e.kind === 'fireball')!.state).toBe('dead');
  });
  it('a fireball explodes on a wall without hurting', () => {
    const w = mk([{ kind: 'ember', pos: { x: 7, y: 4.5 } }]);
    w.player.pos = { x: 1.5, y: 7.5 };
    spawnFireball(w, ent(w), { x: 13, y: 4.5 });
    run(w, 80);
    expect(w.player.health).toBe(100);
    expect(w.entities.some((e) => e.kind === 'fireball')).toBe(false);
  });
  it('an ember eventually fires at the player', () => {
    let fired = false;
    for (let seed = 1; seed <= 6 && !fired; seed++) {
      const w = mk([{ kind: 'ember', pos: { x: 8, y: 4.5 }, angle: Math.PI }], seed);
      for (let i = 0; i < 200 && !fired; i++) { tick(w, cmd()); fired = w.entities.some((e) => e.kind === 'fireball'); }
    }
    expect(fired).toBe(true);
  });
  it('a lone ember returns to its nest when the player is gone', () => {
    const w = mk([{ kind: 'ember', pos: { x: 6, y: 4.5 }, angle: Math.PI, health: 1000 }], 2, { walls: ['4,1', '4,2', '4,3', '4,4', '4,5', '4,6', '4,7'] });
    run(w, 5);
    ent(w).pos = { x: 11.5, y: 2.5 };
    ent(w).alerted = true;
    run(w, 400);
    expect(Math.hypot(ent(w).pos.x - 6, ent(w).pos.y - 4.5)).toBeLessThan(1);
    expect(ent(w).state).toBe('idle');
  });
  it('embers do not hurt each other with fireballs', () => {
    const w = mk([{ kind: 'ember', pos: { x: 6, y: 4.5 } }, { kind: 'ember', pos: { x: 9, y: 4.5 } }]);
    w.player.pos = { x: 1.5, y: 7.5 };
    spawnFireball(w, ent(w, 0), ent(w, 1).pos);
    run(w, 30);
    expect(ent(w, 1).health).toBe(40);
  });
});

describe('hound, collar and infighting', () => {
  it('a collared hound charges and bites', () => {
    const w = mk([ahead(5, 'hound', { collar: true, health: 150 })]);
    const x0 = ent(w).pos.x;
    run(w, 60);
    expect(ent(w).pos.x).toBeLessThan(x0 - 1);
    run(w, 100);
    expect(w.player.health).toBeLessThan(100);
  });
  it('a centred shot can break the collar instead of damaging; the hound then fights demons', () => {
    let broke = false;
    for (let seed = 1; seed <= 12 && !broke; seed++) {
      const w = mk([ahead(4, 'hound', { collar: true, health: 1000 }), { kind: 'ember', pos: { x: 6.5, y: 6.5 }, angle: 0, health: 1000 }], seed);
      for (let i = 0; i < 25 && ent(w).collar; i++) { w.player.weaponCooldown = 0; tick(w, cmd({ fire: true })); }
      if (ent(w).collar) continue;
      broke = true;
      expect(ent(w).health).toBeGreaterThan(900);
      const hpBefore = ent(w, 1).health;
      const playerHp = w.player.health;
      run(w, 150);
      expect(ent(w, 1).health).toBeLessThan(hpBefore);
      expect(ent(w, 1).target).toBe(ent(w).id);
      expect(w.player.health).toBeGreaterThanOrEqual(playerHp - 24); // may only be touched by the ember
    }
    expect(broke).toBe(true);
  });
  it('a freed hound ignores the player until shot, then turns on them', () => {
    const w = mk([ahead(4, 'hound', { collar: false, health: 1000 })]);
    run(w, 30);
    expect(w.player.health).toBe(100);
    expect(ent(w).state).toBe('idle');
    tick(w, cmd({ fire: true }));
    run(w, 100);
    expect(ent(w).data.provoked).toBe(true);
    expect(w.player.health).toBeLessThan(100);
  });
  it('a monster damaged by another monster retargets it (infighting)', () => {
    const w = mk([{ kind: 'possessed', pos: { x: 8, y: 4.5 }, angle: Math.PI, health: 1000 }, { kind: 'hound', pos: { x: 9, y: 4.5 }, angle: 0, health: 1000, collar: false }]);
    run(w, 80);
    expect(ent(w, 0).target).toBe(ent(w, 1).id);
  });
});

describe('determinism', () => {
  it('same seed gives identical worlds, different seed differs', () => {
    const mkw = (seed: number) => mk([ahead(3), ahead(5, 'ember'), ahead(6, 'hound', { collar: true, health: 150 }), ahead(7, 'crew')], seed);
    const play = (w: World) => { for (let i = 0; i < 400; i++) tick(w, cmd({ fire: i % 17 === 0, turn: i % 50 === 0 ? 0.1 : 0, read: i % 3 === 0, stun: i === 100 })); return w; };
    const a = play(mkw(5)), b = play(mkw(5)), c = play(mkw(6));
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(c));
  });
});
