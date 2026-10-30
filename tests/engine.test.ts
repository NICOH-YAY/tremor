import { test, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
test.skipIf(!existsSync('public/engine/doom.wasm'))('built engine and free IWAD are present', () => {
 expect(readFileSync('public/engine/doom.wasm').subarray(0,4).toString('hex')).toBe('0061736d');
 expect(existsSync('public/engine/doom.js')).toBe(true);
 expect(readFileSync('public/wad/freedoom1.wad').subarray(0,4).toString()).toBe('IWAD');
});
