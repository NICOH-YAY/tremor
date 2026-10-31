import type { AudioBus, PlayerPose, Vec2 } from '../sim/types';

/**
 * Procedural WebAudio bus. No files. Safe in environments without audio (tests): every call becomes a no-op.
 * Names: shotgun, fire, stun, zap, purge, door, pickup, alert_possessed, alert_ember, alert_hound, fireball,
 * hurt, playerHurt, radio, step, drone (also accepts event types: fire, door, pickup, radio, playerHurt, kill, cured, read).
 */
type Ctx = AudioContext;
interface Out { gain: GainNode; pan: StereoPannerNode | null }

const MAX_DIST = 18;
let ctx: Ctx | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let unlockHooked = false;
let droneOn = false;
let lastStep = 0;

function getCtx(): Ctx | null {
  if (ctx) return ctx;
  try {
    const AC = (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    const len = ctx.sampleRate;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let s = 12345; // local deterministic noise; never touches simulation RNG
    for (let i = 0; i < len; i++) { s = (s * 1664525 + 1013904223) >>> 0; d[i] = s / 2147483648 - 1; }
    return ctx;
  } catch { ctx = null; return null; }
}

function hookUnlock(): void {
  if (unlockHooked || typeof window === 'undefined' || !window.addEventListener) return;
  unlockHooked = true;
  const go = () => {
    const c = getCtx();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
    startDrone();
  };
  for (const ev of ['pointerdown', 'keydown', 'touchstart', 'click']) window.addEventListener(ev, go, { passive: true });
}

function ready(): Ctx | null {
  hookUnlock();
  const c = getCtx();
  if (!c || !master || c.state !== 'running') return null;
  return c;
}

function route(c: Ctx, pos?: Vec2, listener?: PlayerPose): Out | null {
  const gain = c.createGain();
  let pan: StereoPannerNode | null = null;
  let g = 1;
  if (pos && listener) {
    const dx = pos.x - listener.pos.x, dy = pos.y - listener.pos.y;
    const dist = Math.hypot(dx, dy);
    g = Math.max(0, 1 - dist / MAX_DIST) ** 1.5;
    if (g < 0.01) return null;
    // Positive angles turn toward +Y, so a source with positive sin(relative bearing) is on the listener's right.
    const rel = Math.atan2(dy, dx) - listener.angle;
    const side = Math.sin(rel);
    if (typeof c.createStereoPanner === 'function') {
      pan = c.createStereoPanner();
      pan.pan.value = Math.max(-1, Math.min(1, side * 0.85)) * Math.min(1, dist / 2);
    }
  }
  gain.gain.value = g;
  if (pan) { gain.connect(pan); pan.connect(master!); } else gain.connect(master!);
  return { gain, pan };
}

function noise(c: Ctx, out: Out, t: number, dur: number, vol: number, filt?: { type: BiquadFilterType; f: number; to?: number; q?: number }): void {
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node: AudioNode = src;
  if (filt) {
    const f = c.createBiquadFilter();
    f.type = filt.type;
    f.frequency.setValueAtTime(filt.f, t);
    if (filt.to) f.frequency.exponentialRampToValueAtTime(filt.to, t + dur);
    f.Q.value = filt.q ?? 1;
    node.connect(f); node = f;
  }
  node.connect(g); g.connect(out.gain);
  src.start(t, 0); src.stop(t + dur + 0.02);
}

function tone(c: Ctx, out: Out, t: number, f0: number, f1: number, dur: number, vol: number, type: OscillatorType = 'sine'): void {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out.gain);
  o.start(t); o.stop(t + dur + 0.02);
}

type Voice = (c: Ctx, o: Out, t: number) => void;
const growl = (base: number, rough: number, dur: number): Voice => (c, o, t) => {
  tone(c, o, t, base, base * 0.7, dur, 0.35, 'sawtooth');
  tone(c, o, t, base * 1.5 + rough, base * 0.9, dur * 0.8, 0.12, 'square');
  noise(c, o, t, dur * 0.8, 0.12, { type: 'bandpass', f: base * 4, q: 2 });
};

const voices: Record<string, Voice> = {
  shotgun: (c, o, t) => { noise(c, o, t, 0.28, 0.9, { type: 'lowpass', f: 5000, to: 400 }); tone(c, o, t, 110, 38, 0.3, 0.9); noise(c, o, t + 0.02, 0.5, 0.18, { type: 'lowpass', f: 900, to: 150 }); },
  stun: (c, o, t) => { tone(c, o, t, 1400, 160, 0.22, 0.3, 'sawtooth'); noise(c, o, t, 0.18, 0.35, { type: 'highpass', f: 3000 }); },
  purge: (c, o, t) => { tone(c, o, t, 90, 90, 0.9, 0.35, 'sine'); tone(c, o, t, 180, 420, 0.9, 0.18, 'triangle'); tone(c, o, t + 0.3, 420, 840, 0.5, 0.1, 'sine'); },
  door: (c, o, t) => { noise(c, o, t, 0.5, 0.35, { type: 'bandpass', f: 220, to: 120, q: 3 }); tone(c, o, t, 70, 50, 0.45, 0.3, 'square'); tone(c, o, t + 0.45, 60, 35, 0.1, 0.4); },
  pickup: (c, o, t) => { tone(c, o, t, 660, 660, 0.09, 0.22, 'square'); tone(c, o, t + 0.07, 990, 990, 0.14, 0.22, 'square'); },
  alert_possessed: growl(140, 20, 0.5),
  alert_ember: growl(220, 60, 0.45),
  alert_hound: growl(80, 15, 0.6),
  fireball: (c, o, t) => { noise(c, o, t, 0.7, 0.45, { type: 'bandpass', f: 300, to: 1800, q: 1.5 }); tone(c, o, t, 90, 200, 0.5, 0.15, 'sawtooth'); },
  hurt: (c, o, t) => { tone(c, o, t, 260, 110, 0.22, 0.4, 'sawtooth'); noise(c, o, t, 0.15, 0.2, { type: 'bandpass', f: 800, q: 1 }); },
  radio: (c, o, t) => { noise(c, o, t, 0.12, 0.25, { type: 'bandpass', f: 2400, q: 4 }); tone(c, o, t + 0.12, 1000, 1000, 0.08, 0.18, 'square'); tone(c, o, t + 0.22, 1400, 1400, 0.08, 0.18, 'square'); },
  step: (c, o, t) => { noise(c, o, t, 0.05, 0.25, { type: 'lowpass', f: 600 }); tone(c, o, t, 90, 60, 0.05, 0.2); },
};

/** Map game event types and loose names onto voices. */
const alias: Record<string, string> = {
  fire: 'shotgun', zap: 'stun', stunned: 'stun', cured: 'purge', hit: 'hurt', playerHurt: 'hurt', kill: 'hurt', read: 'radio',
  footstep: 'step', alert: 'alert_possessed', possessed: 'alert_possessed', ember: 'alert_ember', hound: 'alert_hound',
  noise: '', levelEnd: 'pickup', levelend: 'pickup',
};

function startDrone(): void {
  if (droneOn) return;
  const c = ready();
  if (!c || !master) return;
  droneOn = true;
  const g = c.createGain();
  g.gain.value = 0.05;
  g.connect(master);
  for (const f of [43, 43.6, 64.5]) {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 160;
    o.connect(lp); lp.connect(g); o.start();
  }
}

export const audio: AudioBus = {
  play(name: string, pos?: Vec2, listener?: PlayerPose): void {
    try {
      const key = name in voices ? name : (alias[name] ?? name);
      if (key === 'drone') { startDrone(); return; }
      const voice = voices[key];
      const c = ready();
      if (!voice || !c) return;
      startDrone();
      if (key === 'step') { // rate-limit footsteps
        if (c.currentTime - lastStep < 0.12) return;
        lastStep = c.currentTime;
      }
      const out = route(c, pos, listener);
      if (!out) return;
      voice(c, out, c.currentTime + 0.005);
    } catch { /* audio must never break the game */ }
  },
};
export default audio;
