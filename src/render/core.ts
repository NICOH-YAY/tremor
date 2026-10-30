/**
 * Pure software raycaster core. Writes packed ABGR pixels into a Uint32Array; no DOM, no allocation per pixel.
 * Conventions: x right / y down on the map, positive angles turn toward +Y, tile units.
 */
import type { World, PlayerPose, RenderView, Entity, Vec2, TileMap } from '../sim/types';
import type { Tex, Textures } from './textures';

export interface RenderFx {
  /** 0..1 red damage vignette strength. When omitted it is derived from the current events (playerHurt). */
  hurt?: number;
  /** Interpolation factor 0..1 between prevEntityPos and current entity positions. */
  alpha?: number;
  prevEntityPos?: Map<number, Vec2>;
}

const FOCAL_PER_H = 1.185; // focal length in pixels per pixel of height (0.75 half-plane at 16:9)
const MAX_SPRITES = 192;
const ALPHA = 0xff000000;

interface Item {
  tex: Tex; depth: number; sx: number; worldH: number; lift: number; wScale: number;
  mode: number; // 0 normal, 1 silhouette, 2 dead, 3 glow (additive), 4 fullbright
  light: number; eye: boolean;
}
const pool: Item[] = [];
for (let i = 0; i < MAX_SPRITES; i++) pool.push({ tex: null as unknown as Tex, depth: 0, sx: 0, worldH: 0, lift: 0, wScale: 1, mode: 0, light: 1, eye: false });
const order: Item[] = new Array(MAX_SPRITES);

let zbuf = new Float32Array(0);
const doorCache = new WeakMap<TileMap, Int16Array>();
const lightCache = new WeakMap<number[], Uint16Array>();
const vigCache = new Map<number, Uint8Array>();

function doorIndex(m: TileMap): Int16Array {
  let a = doorCache.get(m);
  if (!a || a.length !== m.width * m.height) {
    const arr = new Int16Array(m.width * m.height).fill(-1);
    m.doors.forEach((d, i) => { if (d.x >= 0 && d.y >= 0 && d.x < m.width && d.y < m.height) arr[d.y * m.width + d.x] = i; });
    a = arr;
    doorCache.set(m, a);
  }
  return a;
}
/** map.light is accepted as 0..1 (or 0..255 if any value exceeds 1). Stored as 0..256. */
function lightLut(m: TileMap): Uint16Array | null {
  const l = m.light;
  if (!l || l.length < m.width * m.height) return null;
  let a = lightCache.get(l);
  if (!a) {
    let max = 0;
    for (let i = 0; i < l.length; i++) if (l[i] > max) max = l[i];
    const div = max > 1 ? 255 : 1;
    a = new Uint16Array(l.length);
    for (let i = 0; i < l.length; i++) a[i] = Math.max(0, Math.min(1, l[i] / div)) * 256;
    lightCache.set(l, a);
  }
  return a;
}
function vignette(w: number, h: number): Uint8Array {
  const key = w * 4096 + h;
  let v = vigCache.get(key);
  if (!v) {
    v = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = (x + 0.5) / w * 2 - 1, ny = (y + 0.5) / h * 2 - 1;
      const d = Math.min(1.4, Math.sqrt(nx * nx * 0.8 + ny * ny * 0.9));
      v[y * w + x] = 255 - Math.min(150, Math.pow(d, 2.6) * 70);
    }
    if (vigCache.size > 4) vigCache.clear();
    vigCache.set(key, v);
  }
  return v;
}

/** (c * b) >> 8 on packed RGB, b in 0..256. Alpha forced opaque. */
const shade = (c: number, b: number): number => (ALPHA | (((((c & 0xff00ff) * b) >>> 8) & 0xff00ff) | ((((c & 0xff00) * b) >>> 8) & 0xff00))) >>> 0;
const hash2 = (a: number, b: number): number => { let n = Math.imul(a, 374761393) + Math.imul(b, 668265263); n = Math.imul(n ^ (n >>> 13), 1274126177); return (n ^ (n >>> 16)) >>> 0; };

function entitySprite(e: Entity, t: Textures): { tex: Tex; worldH: number } | null {
  switch (e.kind) {
    case 'possessed': return { tex: t.possessed, worldH: 0.9 };
    case 'crew': return { tex: t.crew, worldH: 0.9 };
    case 'ember': return { tex: t.ember, worldH: 0.85 };
    case 'hound': return { tex: t.hound, worldH: 0.62 };
    default: return null;
  }
}
function pickupTex(e: Entity, t: Textures): Tex {
  if(e.data.item==='ammo')return t.ammo;
  if(e.data.item==='purge')return t.purge;
  let s = '';
  for (const k of ['name', 'type', 'item', 'pickup', 'color', 'kind']) { const v = e.data[k]; if (typeof v === 'string') s += ' ' + v; }
  s = s.toLowerCase();
  if (s.includes('blue')) return t.keyBlue;
  if (s.includes('key') || s.includes('card') || s.includes('red')) return t.keyRed;
  return t.medkit;
}

function drawGlow(buf: Uint32Array, w: number, h: number, cx: number, cy: number, r: number, k: number): void {
  const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h - 1, Math.ceil(cy + r));
  const ir = 1 / r;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const dx = (x - cx) * ir, dy = (y - cy) * ir, d2 = dx * dx + dy * dy;
    if (d2 >= 1) continue;
    const f = (1 - d2) * (1 - d2) * k, i = y * w + x, c = buf[i];
    const rr = Math.min(255, (c & 255) + 255 * f) | 0, gg = Math.min(255, ((c >> 8) & 255) + 190 * f) | 0, bb = Math.min(255, ((c >> 16) & 255) + 80 * f) | 0;
    buf[i] = (ALPHA | (bb << 16) | (gg << 8) | rr) >>> 0;
  }
}

export function renderToBuffer(buf: Uint32Array, w: number, h: number, world: World, pose: PlayerPose, view: RenderView, tex: Textures, fx?: RenderFx): void {
  const map = world.map, mw = map.width, mh = map.height, cells = map.cells, doors = map.doors;
  const dIdx = doorIndex(map), lut = lightLut(map);
  const tic = world.tic;
  if (zbuf.length < w) zbuf = new Float32Array(w);

  // ---- camera, bob, shake -------------------------------------------------
  const focal = h * FOCAL_PER_H, planeLen = (w / 2) / focal;
  const spd = Math.min(1, Math.hypot(world.player.vel.x, world.player.vel.y) / 0.1);
  const bobPh = view.bob * 2.2;
  const shk = view.shake;
  const jx = shk ? Math.sin(tic * 2.31 + 1.3) * Math.cos(tic * 3.77) * shk : 0;
  const jy = shk ? Math.sin(tic * 3.13 + 0.4) * Math.cos(tic * 2.09) * shk : 0;
  const hz = h / 2 + jy + Math.sin(bobPh * 2) * 1.6 * spd;
  const ang = pose.angle + jx * 0.003 + Math.sin(bobPh) * 0.0035 * spd;
  const dirX = Math.cos(ang), dirY = Math.sin(ang);
  const plX = -dirY * planeLen, plY = dirX * planeLen;
  const px = pose.pos.x, py = pose.pos.y;

  // ---- lighting -----------------------------------------------------------
  const flashN = view.flash > 0 ? Math.min(1, view.flash) : 0;
  const flashAdd256 = (flashN * 0.6 * 256) | 0;
  const fog = (distance: number): number => Math.max(0.03, 1 - Math.max(0, distance - 4) / 14);
  const ambient = (light: number): number => 115 + light * 141 / 256;
  const baseLight = (x: number, y: number): number => {
    if (!lut || x < 0 || y < 0 || x >= mw || y >= mh) return 256;
    return lut[y * mw + x];
  };

  // ---- ceiling and floor --------------------------------------------------
  const floorTex = tex.floor, fw = floorTex.w, fh = floorTex.h, fdata = floorTex.data;
  const fwMask = fw - 1, fhMask = fh - 1;
  const startPlX = dirX - plX, startPlY = dirY - plY;
  for (let y = 0; y < h; y++) {
    const rowOff = y + 0.5 - hz, ceiling = rowOff < 0;
    const dist = 0.5 * focal / Math.max(0.001, Math.abs(rowOff));
    const rowA = (fog(dist) * 256) | 0, o = y * w;
    let wx = px + startPlX * dist, wy = py + startPlY * dist;
    const sx = plX * 2 * dist / w, sy = plY * 2 * dist / w;
    for (let x = 0; x < w; x++, wx += sx, wy += sy) {
      const cx = Math.floor(wx), cy = Math.floor(wy);
      const u = ((wx - cx) * fw) & fwMask, v = ((wy - cy) * fh) & fhMask;
      const cl = ambient(baseLight(cx, cy));
      let b = Math.min(256, (rowA * (cl + flashAdd256)) >> 8);
      if (ceiling) b = (b * 90) >> 8;
      const c = fdata[v * fw + u];
      // Slight blue-grey tint on the textured ceiling; no extra texture allocation.
      buf[o + x] = ceiling
        ? (ALPHA | (((((c >>> 16) & 255) * b) >> 8) << 16) | (((((c >>> 8) & 255) * b * .94) >> 8) << 8) | (((c & 255) * b * .84) >> 8)) >>> 0
        : shade(c, b);
    }
  }

  // ---- walls --------------------------------------------------------------
  const wallTexFallback = tex.walls[1] ?? tex.door;
  for (let x = 0; x < w; x++) {
    const camX = 2 * (x + 0.5) / w - 1;
    const rdx = dirX + plX * camX, rdy = dirY + plY * camX;
    let mx = Math.floor(px), my = Math.floor(py);
    const ddx = rdx === 0 ? 1e30 : Math.abs(1 / rdx), ddy = rdy === 0 ? 1e30 : Math.abs(1 / rdy);
    const stX = rdx < 0 ? -1 : 1, stY = rdy < 0 ? -1 : 1;
    let sdx = (rdx < 0 ? px - mx : mx + 1 - px) * ddx, sdy = (rdy < 0 ? py - my : my + 1 - py) * ddy;
    let side = 0, hitDoor = -1, wallId = 1, lastCi = Math.floor(py) * mw + Math.floor(px), ok = false;
    for (let i = 0; i < 96; i++) {
      if (mx >= 0 && my >= 0 && mx < mw && my < mh) lastCi = my * mw + mx;
      if (sdx < sdy) { sdx += ddx; mx += stX; side = 0; } else { sdy += ddy; my += stY; side = 1; }
      if (mx < 0 || my < 0 || mx >= mw || my >= mh) { wallId = 1; hitDoor = -1; ok = true; break; }
      const ci = my * mw + mx, di = dIdx[ci];
      if (di >= 0) {
        const d = doors[di];
        if (d.sealed === true || d.openAmount < 0.85) { hitDoor = di; ok = true; break; }
      } else if (cells[ci] > 0) { wallId = cells[ci]; hitDoor = -1; ok = true; break; }
    }
    let perp = side === 0 ? sdx - ddx : sdy - ddy;
    if (!ok) perp = 64;
    if (perp < 0.02) perp = 0.02;
    zbuf[x] = perp;
    if (!ok) continue;

    const t = hitDoor >= 0 ? tex.door : (tex.walls[wallId] ?? wallTexFallback);
    const tw = t.w, th = t.h;
    let wallX = side === 0 ? py + perp * rdy : px + perp * rdx; wallX -= Math.floor(wallX);
    let u = (wallX * tw) | 0;
    if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) u = tw - 1 - u;
    u &= tw - 1;

    const lineH = focal / perp, top = hz - lineH / 2, bottom = top + lineH;
    const open = hitDoor >= 0 ? doors[hitDoor].openAmount : 0;
    const off = open > 0 ? open * lineH : 0;
    const yEnd = Math.min(h, Math.ceil(bottom - off));
    const y0 = Math.max(0, Math.ceil(top));
    if (y0 >= yEnd) continue;
    const step = th / lineH;
    let tp = (y0 - top + off) * step;
    const L = ambient(baseLight(lastCi % mw, (lastCi / mw) | 0));
    const atten = fog(perp);
    let b = (atten * (L + flashAdd256)) | 0; if (side === 1) b = (b * 200) >> 8; if (b > 256) b = 256;
    const tdata = t.data, thMask = th - 1;
    for (let y = y0; y < yEnd; y++, tp += step) {
      const c = tdata[((tp | 0) & thMask) * tw + u];
      buf[y * w + x] = (ALPHA | (((((c & 0xff00ff) * b) >>> 8) & 0xff00ff) | ((((c & 0xff00) * b) >>> 8) & 0xff00))) >>> 0;
    }
  }

  // ---- sprites ------------------------------------------------------------
  let n = 0;
  const alpha = fx?.alpha ?? 1, prevPos = fx?.prevEntityPos;
  const ents = world.entities;
  const addItem = (tx: Tex, ex: number, ey: number, worldH: number, lift: number, wScale: number, mode: number, eye: boolean): void => {
    if (n >= MAX_SPRITES) return;
    const dx = ex - px, dy = ey - py;
    const depth = dx * dirX + dy * dirY;
    if (depth < 0.15) return;
    const lateral = -dx * dirY + dy * dirX;
    const sx = w / 2 + lateral / depth * focal;
    if (Math.abs(sx - w / 2) > w * 3) return;
    const it = pool[n++];
    it.tex = tx; it.depth = depth; it.sx = sx; it.worldH = worldH; it.lift = lift; it.wScale = wScale; it.mode = mode; it.eye = eye;
    it.light = baseLight(Math.floor(ex), Math.floor(ey)) / 256;
  };
  for (let i = 0; i < ents.length; i++) {
    const e = ents[i];
    let ex = e.pos.x, ey = e.pos.y;
    if (prevPos) {
      const pp = prevPos.get(e.id);
      if (pp && Math.abs(pp.x - ex) < 2 && Math.abs(pp.y - ey) < 2) { ex = pp.x + (ex - pp.x) * alpha; ey = pp.y + (ey - pp.y) * alpha; }
    }
    if (e.kind === 'fireball') { if (e.health > 0 && e.state !== 'dead') addItem(tex.fireball, ex, ey, 0.3, 0.35, 1, 3, false); else if(tic-Number(e.data.diedAt??-100)<9)addItem(tex.fireball,ex,ey,.45,.2,1.4,3,false); continue; }
    if (e.kind === 'pickup') { if (e.health > 0) addItem(pickupTex(e, tex), ex, ey, 0.32, 0, 1, 4, false); continue; }
    const sp = entitySprite(e, tex);
    if (!sp) continue;
    if (e.health <= 0 || e.state === 'dead') { addItem(sp.tex, ex, ey, sp.worldH * 0.28, 0, 1.2, 2, false); continue; }
    const cured = e.state === 'cured';
    const dist = Math.hypot(ex - px, ey - py);
    const lightHere = baseLight(Math.floor(ex), Math.floor(ey)) / 256;
    const ambiguous = (e.kind === 'possessed' || e.kind === 'crew') && !cured && !e.revealed && (dist > 6 || lightHere < 0.4);
    if (ambiguous) addItem(tex.possessed, ex, ey, 0.9, 0, 1, 1, false); // identical mask for crew and Possessed
    else addItem(sp.tex, ex, ey, sp.worldH, 0, 1, 0, e.kind === 'possessed' && e.revealed && !cured);
  }
  for (let i = 0; i < map.keys.length; i++) {
    const k = map.keys[i];
    if (!k.collected) addItem(k.color === 'blue' ? tex.keyBlue : tex.keyRed, k.pos.x, k.pos.y, 0.32, 0.12 + Math.sin(tic * 0.12 + i) * 0.03, 1, 4, false);
  }
  addItem(tex.exit,map.exit.x,map.exit.y,.22,0,1,4,false);
  for (let i = 0; i < n; i++) { // insertion sort far -> near
    const it = pool[i]; let j = i - 1;
    while (j >= 0 && order[j].depth < it.depth) { order[j + 1] = order[j]; j--; }
    order[j + 1] = it;
  }
  const sTic = tic >> 2;
  for (let s = 0; s < n; s++) {
    const it = order[s], t = it.tex, tw = t.w, th = t.h, td = t.data;
    const heightPx = it.worldH * focal / it.depth;
    const widthPx = heightPx * (tw / th) * it.wScale;
    const bottom = hz + (0.5 - it.lift) * focal / it.depth, top = bottom - heightPx;
    const left = it.sx - widthPx / 2;
    const x0 = Math.max(0, Math.floor(left)), x1 = Math.min(w, Math.ceil(left + widthPx));
    const y0 = Math.max(0, Math.ceil(top)), y1 = Math.min(h, Math.ceil(bottom));
    if (x0 >= x1 || y0 >= y1) continue;
    const atten = fog(it.depth);
    let b = (atten * (ambient(it.light * 256) + flashAdd256)) | 0;
    if (it.mode === 2) b = (b * 140) >> 8;
    if (b > 256) b = 256;
    const mode = it.mode, vstep = th / heightPx, ustep = tw / widthPx;
    for (let x = x0; x < x1; x++) {
      if (it.depth >= zbuf[x]) continue;
      const tu = Math.min(tw - 1, ((x + 0.5 - left) * ustep) | 0);
      let tv = (y0 - top) * vstep;
      for (let y = y0; y < y1; y++, tv += vstep) {
        const ty = Math.min(th - 1, tv | 0), c = td[ty * tw + tu], a = c >>> 24;
        if (a < 128) continue;
        const i = y * w + x;
        if (mode === 0 || mode === 2) buf[i] = shade(c, b);
        else if (mode === 4) buf[i] = shade(c, 256);
        else if (mode === 1) { const v = 9 + ((hash2(tu, ty + sTic * 131) >>> 28) & 7); buf[i] = (ALPHA | ((v + 3) << 16) | (v << 8) | v) >>> 0; }
        else {
          const d = buf[i];
          const rr = Math.min(255, (d & 255) + (((c & 255) * a) >> 8)), gg = Math.min(255, ((d >> 8) & 255) + ((((c >> 8) & 255) * a) >> 8)), bb = Math.min(255, ((d >> 16) & 255) + ((((c >> 16) & 255) * a) >> 8));
          buf[i] = (ALPHA | (bb << 16) | (gg << 8) | rr) >>> 0;
        }
      }
    }
    if (it.eye && (hash2(tic >> 1, 77) >>> 29) < 5) { // faint red eye glint, deterministic flicker
      const ey = Math.round(top + heightPx * 0.13), ec = Math.round(it.sx), gap = Math.max(1, Math.round(widthPx * 0.09));
      for (let k = -1; k <= 1; k += 2) {
        const exx = ec + k * gap;
        if (exx >= 0 && exx < w && ey >= 0 && ey < h && it.depth < zbuf[exx]) buf[ey * w + exx] = (ALPHA | (40 << 16) | (40 << 8) | 255) >>> 0;
      }
    }
  }

  // ---- first-person weapon ------------------------------------------------
  const wt = tex.weapon;
  const dh = h * 0.33, dw = dh * wt.w / wt.h;
  const recoil = Math.max(0, view.recoil);
  const wx0 = w * 0.60 - dw / 2 + view.weaponSway * 7 + Math.sin(bobPh) * 5 * spd - recoil * 6;
  const wy0 = h * .90 - dh - 2 + -Math.abs(Math.cos(bobPh)) * 3 * spd - recoil * 8;
  {
    const lw = baseLight(Math.floor(px), Math.floor(py));
    const gb = Math.min(256, Math.max(70, lw + 60 + flashAdd256));
    const xs = Math.max(0, Math.floor(wx0)), xe = Math.min(w, Math.ceil(wx0 + dw)), ys = Math.max(0, Math.floor(wy0)), ye = Math.min(h, Math.ceil(wy0 + dh));
    const su = wt.w / dw, sv = wt.h / dh, wd = wt.data;
    for (let y = ys; y < ye; y++) {
      const row = Math.min(wt.h - 1, ((y + 0.5 - wy0) * sv) | 0) * wt.w;
      for (let x = xs; x < xe; x++) {
        const c = wd[row + Math.min(wt.w - 1, ((x + 0.5 - wx0) * su) | 0)];
        if ((c >>> 24) < 128) continue;
        buf[y * w + x] = shade(c, gb);
      }
    }
    if (flashN > 0) drawGlow(buf, w, h, wx0 + dw * 0.05, wy0 + dh * 0.12, 16 + flashN * 26, 0.6 + flashN * 0.6);
  }

  // ---- vignette + damage --------------------------------------------------
  let hurt = fx?.hurt ?? 0;
  if (fx?.hurt === undefined) for (let i = 0; i < world.events.length; i++) if (world.events[i].type === 'playerHurt') { hurt = 1; break; }
  const vig = vignette(w, h), total = w * h;
  if (hurt > 0.01) {
    const hk = Math.min(1, hurt), keep = 1 - 0.3 * hk;
    for (let i = 0; i < total; i++) {
      const b = vig[i], c = buf[i], dark = 255 - b;
      let r = (((c & 255) * b) >> 8) + ((hk * (dark * 2.2 + 30)) | 0); if (r > 255) r = 255;
      const g = ((((c >> 8) & 255) * b) >> 8) * keep, bl = ((((c >> 16) & 255) * b) >> 8) * keep;
      buf[i] = (ALPHA | ((bl | 0) << 16) | ((g | 0) << 8) | r) >>> 0;
    }
  } else {
    for (let i = 0; i < total; i++) {
      const b = vig[i], c = buf[i];
      buf[i] = (ALPHA | (((((c & 0xff00ff) * b) >>> 8) & 0xff00ff) | ((((c & 0xff00) * b) >>> 8) & 0xff00))) >>> 0;
    }
  }
}
