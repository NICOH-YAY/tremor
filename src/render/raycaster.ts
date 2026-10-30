import type { Renderer, World, PlayerPose, RenderView, Vec2 } from '../sim/types';
import { renderToBuffer, type RenderFx } from './core';
import { loadTextures, makeFallbackTextures, type Textures } from './textures';

export { renderToBuffer } from './core';
export type { RenderFx } from './core';
export { loadTextures, makeFallbackTextures } from './textures';
export type { Textures, Tex } from './textures';

const BASE_H = 270;
const HURT_DECAY_SECONDS = 0.45;

/** Canvas 2D software renderer. Internal buffer is ~270 px tall (width follows the canvas aspect), upscaled pixel-crisp. */
export class Raycaster implements Renderer {
  private buffer = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  private W = 480;
  private H = BASE_H;
  private image!: ImageData;
  private pixels!: Uint32Array;
  private textures: Textures = makeFallbackTextures();
  private fx: RenderFx = {};
  private lastTic = -1;
  private cur = new Map<number, Vec2>();
  private prev = new Map<number, Vec2>();
  private hurt = 0;
  private lastHurtTic = -1;
  private lastTime = 0;
  private pose:PlayerPose={pos:{x:0,y:0},angle:0};

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = this.buffer.getContext('2d')!;
    this.alloc(480, BASE_H);
    this.fx.prevEntityPos = this.prev;
    loadTextures('art/', this.textures).catch(() => { /* fallback textures stay */ });
  }

  private alloc(w: number, h: number): void {
    this.W = w; this.H = h;
    this.buffer.width = w; this.buffer.height = h;
    this.image = this.ctx.createImageData(w, h);
    this.pixels = new Uint32Array(this.image.data.buffer);
  }

  resize(w: number, h: number): void {
    this.canvas.width = w; this.canvas.height = h;
    const iw = Math.max(320, Math.min(640, Math.round(BASE_H * (w / Math.max(1, h)) / 2) * 2));
    if (iw !== this.W) this.alloc(iw, BASE_H);
  }

  render(world: World, prevPose: PlayerPose, alpha: number, view: RenderView): void {
    const a = Math.max(0, Math.min(1, alpha));
    const pp = world.player;
    const delta = Math.atan2(Math.sin(pp.angle - prevPose.angle), Math.cos(pp.angle - prevPose.angle));
    const pose=this.pose;
    pose.pos.x=prevPose.pos.x+(pp.pos.x-prevPose.pos.x)*a;
    pose.pos.y=prevPose.pos.y+(pp.pos.y-prevPose.pos.y)*a;
    pose.angle=prevPose.angle+delta*a;

    // entity position history for interpolation (once per sim tic)
    if (world.tic !== this.lastTic) {
      const t = this.prev; this.prev = this.cur; this.cur = t;
      if (world.tic < this.lastTic) this.prev.clear(); // world reset
      this.cur.clear();
      for (const e of world.entities) this.cur.set(e.id, { x: e.pos.x, y: e.pos.y });
      // prev now holds the previous tic's positions; entities new this tic have no entry (no lerp)
      this.fx.prevEntityPos = this.prev;
      this.lastTic = world.tic;
    }
    this.fx.alpha = a;

    // damage vignette with a short decay
    const now = performance.now();
    const dt = this.lastTime ? Math.min(0.1, (now - this.lastTime) / 1000) : 0;
    this.lastTime = now;
    this.hurt = Math.max(0, this.hurt - dt / HURT_DECAY_SECONDS);
    if (world.tic !== this.lastHurtTic && world.events.some((e) => e.type === 'playerHurt')) { this.hurt = 1; this.lastHurtTic = world.tic; }
    this.fx.hurt = this.hurt;

    renderToBuffer(this.pixels, this.W, this.H, world, pose, view, this.textures, this.fx);
    this.ctx.putImageData(this.image, 0, 0);
    const out = this.canvas.getContext('2d')!;
    out.imageSmoothingEnabled = false;
    out.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);
  }
}
