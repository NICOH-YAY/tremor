import type { World, RNG } from './types';
/** Original mulberry-style integer mixer; state lives in World for save/replay. */
export function worldRng(world:World):RNG { return () => { world.rngState = (world.rngState + 0x6d2b79f5) >>> 0; let n=world.rngState; n=Math.imul(n^(n>>>15),n|1); n^=n+Math.imul(n^(n>>>7),n|61); return ((n^(n>>>14))>>>0)/4294967296; }; }
