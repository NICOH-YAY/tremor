/** Texture storage and loading. Texels are packed little-endian ABGR (0xAABBGGRR) as in ImageData. */
export interface Tex { w: number; h: number; data: Uint32Array }
export interface Textures {
  /** wall texture by map cell id (power-of-two square) */
  walls: Record<number, Tex | undefined>;
  door: Tex;
  floor: Tex;
  possessed: Tex;
  crew: Tex;
  ember: Tex;
  hound: Tex;
  weapon: Tex;
  /** procedural */
  fireball: Tex;
  medkit: Tex;
  ammo: Tex;
  purge: Tex;
  exit: Tex;
  keyRed: Tex;
  keyBlue: Tex;
}

export const pack = (r: number, g: number, b: number, a = 255): number => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;

function make(w: number, h: number, fn: (x: number, y: number) => number): Tex {
  const data = new Uint32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data[y * w + x] = fn(x, y);
  return { w, h, data };
}
const hash = (x: number, y: number): number => { let n = (x * 374761393 + y * 668265263) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };

/** Flat-colour style fallback so renders work with no images (tests, failed loads). */
function flat(w: number, r: number, g: number, b: number, lines = true): Tex {
  return make(w, w, (x, y) => {
    const n = (hash(x, y) - 0.5) * 14;
    const l = lines && (x % (w >> 2) === 0 || y % (w >> 2) === 0) ? -18 : 0;
    const k = n + l;
    return pack(Math.max(0, Math.min(255, r + k)), Math.max(0, Math.min(255, g + k)), Math.max(0, Math.min(255, b + k)));
  });
}
const flatSprite = (w: number, h: number, r: number, g: number, b: number): Tex =>
  make(w, h, (x, y) => {
    const cx = (x + 0.5) / w - 0.5;
    const body = Math.abs(cx) < 0.22 && y > h * 0.18;
    const head = Math.hypot(cx, (y + 0.5) / h - 0.1) < 0.14;
    return body || head ? pack(r, g, b) : 0;
  });
function glow(size: number, r: number, g: number, b: number): Tex {
  return make(size, size, (x, y) => {
    const d = Math.hypot((x + 0.5) / size - 0.5, (y + 0.5) / size - 0.5) * 2;
    if (d >= 1) return 0;
    const core = Math.max(0, 1 - d * 1.4);
    const a = Math.min(255, Math.round(255 * (1 - d * d)));
    return pack(Math.min(255, r + 255 * core), Math.min(255, g + 200 * core), Math.min(255, b + 120 * core), a);
  });
}
const card = (r: number, g: number, b: number): Tex =>
  make(16, 16, (x, y) => {
    if (x < 4 || x > 11 || y < 3 || y > 12) return 0;
    if (x === 4 || x === 11 || y === 3 || y === 12) return pack(30, 30, 30);
    return y === 5 || y === 6 ? pack(235, 235, 235) : pack(r, g, b);
  });
const medkit = (): Tex =>
  make(16, 16, (x, y) => {
    if (x < 2 || x > 13 || y < 4 || y > 13) return 0;
    if (x === 2 || x === 13 || y === 4 || y === 13) return pack(150, 150, 150);
    const cross = (x >= 7 && x <= 8 && y >= 6 && y <= 11) || (y >= 8 && y <= 9 && x >= 5 && x <= 10);
    return cross ? pack(210, 30, 30) : pack(235, 235, 235);
  });

export function makeFallbackTextures(): Textures {
  const dummy = flat(64, 120, 130, 145);
  return {
    walls: { 1: dummy, 2: flat(64, 130, 110, 100) },
    door: flat(64, 150, 120, 40),
    floor: flat(64, 60, 56, 52, true),
    possessed: flatSprite(32, 64, 140, 155, 115),
    crew: flatSprite(32, 64, 140, 155, 115),
    ember: flatSprite(32, 64, 210, 85, 35),
    hound: flatSprite(48, 40, 160, 110, 90),
    weapon: make(32, 28, (x, y) => (x + y > 20 && x < 24 ? pack(70, 70, 76) : 0)),
    fireball: glow(32, 230, 110, 20),
    exit: make(64,32,(x,y)=>{
      const glyphs=['11111010001001011111','10000010001001000100','11100001010001000100','10000010001001000100','11111010001001000100'];
      if(x<2||x>61||y<2||y>29)return pack(50,240,140);
      const gx=Math.floor((x-10)/2),gy=Math.floor((y-10)/2);
      return gx>=0&&gx<20&&gy>=0&&gy<5&&glyphs[gy][gx]==='1'?pack(210,255,225):pack(9,50,30);
    }),
    medkit: medkit(),
    ammo: make(24,24,(x,y)=>x>2&&x<21&&y>5&&y<22?pack(185,140,40):0),
    purge: make(24,24,(x,y)=>x>7&&x<17&&y>2&&y<22?pack(50,210,200):0),
    keyRed: card(200, 30, 30),
    keyBlue: card(40, 80, 220),
  };
}

function toTex(img: HTMLImageElement, size?: number): Tex {
  const w = size ?? img.naturalWidth, h = size ?? img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, w, h);
  const id = ctx.getImageData(0, 0, w, h);
  return { w, h, data: new Uint32Array(id.data.buffer.slice(0)) };
}
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = url;
  });
}

/** Loads art once; any image that fails keeps its fallback. Safe to call without a DOM (resolves to fallback). */
export async function loadTextures(base = 'art/', into: Textures = makeFallbackTextures()): Promise<Textures> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') return into;
  const jobs: Array<[string, (t: Tex) => void, number | undefined]> = [
    ['wall_hangar.png', (t) => { into.walls[1] = t; }, 128],
    ['wall_quarantine.png', (t) => { into.walls[2] = t; }, 128],
    ['door.png', (t) => { into.door = t; }, 128],
    ['floor.png', (t) => { into.floor = t; }, 128],
    ['possessed.png', (t) => { into.possessed = t; }, undefined],
    ['crew.png', (t) => { into.crew = t; }, undefined],
    ['ember.png', (t) => { into.ember = t; }, undefined],
    ['hound.png', (t) => { into.hound = t; }, undefined],
    ['weapon.png', (t) => { into.weapon = t; }, undefined],
  ];
  await Promise.all(jobs.map(async ([file, set, size]) => {
    try { const img = await loadImage(base + file); if (img) set(toTex(img, size)); } catch { /* keep fallback */ }
  }));
  return into;
}
