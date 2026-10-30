import {test,expect} from 'vitest';
import {spawnSync} from 'node:child_process';
test('production WASM boots once, resumes intro waiters, draws and generates music',()=>{const run=spawnSync(process.execPath,['engine/build/browser-smoke.mjs'],{encoding:'utf8',timeout:15000});expect(run.stderr).toBe('');expect(run.status,run.stdout+run.stderr).toBe(0);expect(JSON.parse(run.stdout.trim())).toMatchObject({inits:1,intros:1,frames:3,music:1});},20000);

test('production objective preview pauses simulation tics',()=>{const run=spawnSync(process.execPath,['engine/build/preview-smoke.mjs'],{encoding:'utf8',timeout:15000});expect(run.status,run.stdout+run.stderr).toBe(0);expect(JSON.parse(run.stdout.trim()).paused).toBe(true);},20000);
