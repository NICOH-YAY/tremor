import {test} from 'vitest';
import {execFileSync} from 'node:child_process';
test('vendored engine patch is current',()=>{execFileSync(process.execPath,['scripts/upstream-patch.mjs','--check']);});
