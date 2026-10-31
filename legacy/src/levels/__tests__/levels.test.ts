import { describe, it, expect } from 'vitest';
import { levels } from '../index';
import { createWorld } from '../../sim/world';
import type { KeyColor, LevelDef, Vec2 } from '../../sim/types';

const ids = ['hangar', 'quarantine', 's1_corridor', 's2_collar', 's3_triage', 'h1_dark', 'h2_door'];

const cellAt = (l: LevelDef, p: Vec2) => l.map.cells[Math.floor(p.y) * l.map.width + Math.floor(p.x)];
const isOpen = (l: LevelDef, p: Vec2) => {
  const x = Math.floor(p.x), y = Math.floor(p.y);
  return x >= 0 && y >= 0 && x < l.map.width && y < l.map.height && cellAt(l, p) === 0;
};

/** Flood fill from spawn with progressive key collection. Sealed doors are impassable; sealable doors are passable. */
function reach(l: LevelDef) {
  const { width: W, height: H } = l.map;
  const have = new Set<KeyColor>();
  const seen = new Set<number>();
  const doorAt = new Map(l.map.doors.map(d => [d.y * W + d.x, d]));
  let grew = true;
  while (grew) {
    grew = false;
    seen.clear();
    const q = [Math.floor(l.map.spawns[0].y) * W + Math.floor(l.map.spawns[0].x)];
    seen.add(q[0]);
    while (q.length) {
      const i = q.pop()!;
      const x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (seen.has(j) || l.map.cells[j] !== 0) continue;
        const d = doorAt.get(j);
        if (d && (d.sealed || (d.key && !have.has(d.key)))) continue;
        seen.add(j);
        q.push(j);
      }
    }
    for (const k of l.map.keys) {
      if (!have.has(k.color) && seen.has(Math.floor(k.pos.y) * W + Math.floor(k.pos.x))) { have.add(k.color); grew = true; }
    }
  }
  return { seen, have, W };
}

describe.each(ids)('level %s', id => {
  const l = levels[id];
  it('is registered with matching id', () => { expect(l).toBeDefined(); expect(l.id).toBe(id); });
  it('has wall borders and sized cells', () => {
    const { width: W, height: H, cells } = l.map;
    expect(cells.length).toBe(W * H);
    for (let x = 0; x < W; x++) { expect(cells[x]).toBeGreaterThan(0); expect(cells[(H - 1) * W + x]).toBeGreaterThan(0); }
    for (let y = 0; y < H; y++) { expect(cells[y * W]).toBeGreaterThan(0); expect(cells[y * W + W - 1]).toBeGreaterThan(0); }
    if (l.map.light) expect(l.map.light.length).toBe(W * H);
  });
  it('spawn, exit, keys, entities and doors sit in open cells', () => {
    expect(isOpen(l, l.map.spawns[0])).toBe(true);
    expect(isOpen(l, l.map.exit)).toBe(true);
    for (const k of l.map.keys) expect(isOpen(l, k.pos)).toBe(true);
    for (const e of l.entities) expect(isOpen(l, e.pos)).toBe(true);
    for (const d of l.map.doors) expect(l.map.cells[d.y * l.map.width + d.x]).toBe(0);
    for (const t of l.map.triggers) expect(isOpen(l, t.pos)).toBe(true);
  });
  it('exit is reachable, each key before its door', () => {
    const r = reach(l);
    expect(r.seen.has(Math.floor(l.map.exit.y) * r.W + Math.floor(l.map.exit.x))).toBe(true);
    for (const k of l.map.keys) expect(r.have.has(k.color)).toBe(true);
    for (const d of l.map.doors) if (d.key) expect(r.have.has(d.key)).toBe(true);
    // every non-closet entity is reachable too (nothing stranded)
    for (const e of l.entities) {
      if (e.data && 'closet' in e.data) continue;
      expect(r.seen.has(Math.floor(e.pos.y) * r.W + Math.floor(e.pos.x))).toBe(true);
    }
  });
  it('creates a world with unique ids and a nonblank end text', () => {
    const w = createWorld(l, 1);
    const set = new Set(w.entities.map(e => e.id));
    expect(set.size).toBe(w.entities.length);
    expect(l.endText(w).length).toBeGreaterThan(10);
  });
});

describe('level design requirements', () => {
  it('hangar has red key, closet hound, 2 purge pickups, and the opening radio line', () => {
    const l = levels.hangar;
    expect(l.map.keys.map(k => k.color)).toEqual(['red']);
    expect(l.entities.filter(e => e.kind === 'pickup' && e.data?.item === 'purge').length).toBe(2);
    expect(l.entities.some(e => e.kind === 'hound' && e.data?.closet === 'red')).toBe(true);
    expect(l.radio?.[0].text).toContain('Reach the lift');
  });
  it('quarantine has a sealable door, blue key, and escalating orders', () => {
    const l = levels.quarantine;
    expect(l.map.doors.some(d => d.sealable)).toBe(true);
    expect(l.map.keys.map(k => k.color)).toEqual(['blue']);
    const texts = l.map.triggers.map(t => t.text ?? '');
    expect(texts.some(t => t === 'Command: Seal door B-2.')).toBe(true);
    expect(texts.some(t => t.includes('Seal it anyway'))).toBe(true);
    expect(texts.some(t => t.includes('Purge the ward'))).toBe(true);
    expect(l.entities.filter(e => e.kind === 'pickup' && e.data?.item === 'medkit').length).toBeGreaterThanOrEqual(2);
  });
});
