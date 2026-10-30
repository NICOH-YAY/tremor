import type { Door, EntitySpawn, KeyColor, MapKey, MapTrigger, TileMap, Vec2, World } from '../sim/types';

/** Small carve-based map builder: start solid, carve rooms, add doors and fixtures. Original layouts only. */
export class MapBuilder {
  cells: number[];
  light: number[];
  doors: Door[] = [];
  keys: MapKey[] = [];
  triggers: MapTrigger[] = [];
  entities: EntitySpawn[] = [];
  spawn: Vec2 = { x: 1.5, y: 1.5 };
  exit: Vec2 = { x: 1.5, y: 1.5 };
  constructor(readonly width: number, readonly height: number, readonly tex: number) {
    this.cells = new Array(width * height).fill(tex);
    this.light = new Array(width * height).fill(1);
  }
  /** Carve an inclusive rectangle of open floor. */
  room(x0: number, y0: number, x1: number, y1: number): this {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.cells[y * this.width + x] = 0;
    return this;
  }
  /** Set light level (0 dark .. 1 bright) over an inclusive rectangle. */
  dim(x0: number, y0: number, x1: number, y1: number, v: number): this {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.light[y * this.width + x] = v;
    return this;
  }
  /** Set a wall cell to an alternate texture (decor / hints). */
  wall(x: number, y: number, t: number): this { this.cells[y * this.width + x] = t; return this; }
  door(x: number, y: number, o: { key?: KeyColor; sealable?: boolean; sealed?: boolean } = {}): this {
    this.cells[y * this.width + x] = 0;
    const d: Door = { x, y, key: o.key ?? null, openAmount: 0, state: 'closed' };
    if (o.sealable) d.sealable = true;
    if (o.sealed) d.sealed = true;
    this.doors.push(d);
    return this;
  }
  start(x: number, y: number): this { this.spawn = { x: x + 0.5, y: y + 0.5 }; return this; }
  end(x: number, y: number): this { this.exit = { x: x + 0.5, y: y + 0.5 }; return this; }
  key(x: number, y: number, color: KeyColor): this { this.keys.push({ pos: { x: x + 0.5, y: y + 0.5 }, color }); return this; }
  trigger(id: string, x: number, y: number, radius: number, text?: string): this {
    const t: MapTrigger = { id, pos: { x: x + 0.5, y: y + 0.5 }, radius };
    if (text !== undefined) t.text = text;
    this.triggers.push(t);
    return this;
  }
  /** Place an entity at the centre of tile (x, y). */
  put(kind: EntitySpawn['kind'], x: number, y: number, extra: Partial<EntitySpawn> = {}): this {
    this.entities.push({ kind, pos: { x: x + 0.5, y: y + 0.5 }, ...extra });
    return this;
  }
  possessed(x: number, y: number): this { return this.put('possessed', x, y); }
  ember(x: number, y: number): this { return this.put('ember', x, y); }
  crew(x: number, y: number, health = 40): this { return this.put('crew', x, y, { health }); }
  hound(x: number, y: number, collar = false, data?: EntitySpawn['data']): this {
    return this.put('hound', x, y, { collar, ...(data ? { data } : {}) });
  }
  /** Pickups are kind 'pickup' with data.item: medkit | ammo | purge. */
  pickup(item: 'medkit' | 'ammo' | 'purge', x: number, y: number): this {
    return this.put('pickup', x, y, { radius: 0.3, data: { item } });
  }
  map(): TileMap {
    return { width: this.width, height: this.height, cells: this.cells, doors: this.doors, light: this.light, spawns: [this.spawn], keys: this.keys, exit: this.exit, triggers: this.triggers };
  }
}

/** Plain counts for end-of-level lines (no score words, no judgement). */
export function crewCounts(w: World) {
  const alive = w.entities.filter(e => e.kind === 'crew' && e.health > 0 && e.state !== 'dead').length;
  return { alive, cured: w.player.saved, lost: w.player.kills.crew };
}
export function plural(n: number, one: string, many: string): string { return `${n} ${n === 1 ? one : many}`; }
