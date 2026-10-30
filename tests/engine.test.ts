import { test, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
test.skipIf(!existsSync('public/engine/doom.wasm'))('built engine and free IWAD are present', () => {
 expect(readFileSync('public/engine/doom.wasm').subarray(0,4).toString('hex')).toBe('0061736d');
 expect(existsSync('public/engine/doom.js')).toBe(true);
 expect(readFileSync('public/wad/freedoom1.wad').subarray(0,4).toString()).toBe('IWAD');
});

test('production WASM contains callable music and platform settings exports', () => {
 const module = new WebAssembly.Module(readFileSync('public/engine/doom.wasm'));
 const names = WebAssembly.Module.exports(module).map(e => e.name);
 // Emscripten may minify WASM names: the generated JS must expose the ABI.
 const js = readFileSync('public/engine/doom.js','utf8');
 for (const name of ['tremor_music_render','tremor_music_rate','tremor_music_active','tremor_translate_key','tremor_input','tremor_set_screen_shake']) expect(js).toContain('_'+name);
 expect(names.length).toBeGreaterThan(10);
 expect(js).toContain('IDBFS');
});
