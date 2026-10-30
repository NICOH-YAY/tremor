import {test,expect} from 'vitest';
import {spawnSync} from 'node:child_process';
test('production WASM boots once, resumes intro waiters, draws and generates music',()=>{const run=spawnSync(process.execPath,['engine/build/browser-smoke.mjs'],{encoding:'utf8',timeout:15000});expect(run.stderr).toBe('');expect(run.status,run.stdout+run.stderr).toBe(0);expect(JSON.parse(run.stdout.trim())).toMatchObject({inits:1,intros:1,frames:3,music:1});},20000);
