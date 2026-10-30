import { describe, it, expect } from 'vitest';
import { createWorld } from '../../sim/world';
import { testRoom } from '../../levels/test_room';
import { renderToBuffer, makeFallbackTextures } from '../raycaster';
import type { RenderView, World } from '../../sim/types';

const W = 480, H = 270;
const view: RenderView = { shake: 0, flash: 0, weaponSway: 0, recoil: 0, bob: 0 };
const tex = makeFallbackTextures();
const pose = (w: World) => ({ pos: { ...w.player.pos }, angle: w.player.angle });
const frame = (w: World, v: RenderView = view, p = pose(w)) => { const b = new Uint32Array(W * H); renderToBuffer(b, W, H, w, p, v, tex); return b; };
const sum = (b: Uint32Array, y0: number, y1: number) => { let s = 0; for (let i = y0 * W; i < y1 * W; i++) s += (b[i] & 255) + ((b[i] >> 8) & 255) + ((b[i] >> 16) & 255); return s; };

describe('renderer core', () => {
  it('fills every pixel opaque and is deterministic', () => {
    const w = createWorld(testRoom, 1);
    const a = frame(w), b = frame(w);
    expect(a.every((p) => p >>> 24 === 255)).toBe(true);
    expect(a).toEqual(b);
  });
  it('muzzle flash brightens the frame', () => {
    const w = createWorld(testRoom, 1);
    expect(sum(frame(w, { ...view, flash: 1 }), 0, H)).toBeGreaterThan(sum(frame(w), 0, H));
  });
  it('fog darkens distant walls vs near walls', () => {
    const w = createWorld(testRoom, 1); w.entities = [];
    w.player.pos = { x: 1.6, y: 3.5 }; w.player.angle = Math.PI; // facing the near west wall
    const near = frame(w); w.player.angle = 0; w.player.pos = { x: 1.5, y: 1.5 }; // far east wall
    const far = frame(w);
    const mid = (b: Uint32Array) => sum(b, H / 2 - 20, H / 2 + 20);
    expect(mid(near)).toBeGreaterThan(mid(far));
  });
  it('unrevealed crew and Possessed are indistinguishable at range; revealed ones differ', () => {
    const mk = (kind: 'crew' | 'possessed', revealed: boolean) => {
      const w = createWorld(testRoom, 1); w.entities = w.entities.slice(0, 1);
      const e = w.entities[0]; e.kind = kind; e.revealed = revealed; e.pos = { x: 8.5, y: 4.5 }; e.state = 'idle'; e.health = 40;
      w.player.pos = { x: 1.5, y: 4.5 }; w.player.angle = 0; w.map.doors = [];
      return frame(w);
    };
    const bad = mk('crew', false), pos = mk('possessed', false);
    expect(bad).toEqual(pos);
    expect(mk('crew', true)).not.toEqual(mk('possessed', true));
    expect(mk('crew', true)).not.toEqual(bad);
  });
  it('damage vignette adds red', () => {
    const w = createWorld(testRoom, 1);
    const calm = new Uint32Array(W * H), hurt = new Uint32Array(W * H);
    renderToBuffer(calm, W, H, w, pose(w), view, tex, { hurt: 0 });
    renderToBuffer(hurt, W, H, w, pose(w), view, tex, { hurt: 1 });
    let r0 = 0, r1 = 0; for (let i = 0; i < calm.length; i++) { r0 += calm[i] & 255; r1 += hurt[i] & 255; }
    expect(r1).toBeGreaterThan(r0);
  });
  it('renders 100 frames within a CPU budget', () => {
    const w = createWorld(testRoom, 1); const b = new Uint32Array(W * H);
    for (let i = 0; i < 10; i++) renderToBuffer(b, W, H, w, pose(w), view, tex);
    const t0 = performance.now();
    for (let i = 0; i < 100; i++) { w.tic = i; renderToBuffer(b, W, H, w, { pos: w.player.pos, angle: i * 0.06 }, { ...view, bob: i * 0.1 }, tex); }
    const per = (performance.now() - t0) / 100;
    console.log(`render ms/frame: ${per.toFixed(2)}`);
    expect(per).toBeLessThan(16);
  });
});
