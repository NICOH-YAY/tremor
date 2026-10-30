import {test,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('shipped headless artifacts match manifest and production omits privileged fixtures',()=>{const manifest=JSON.parse(readFileSync('public/engine-headless/artifacts.json','utf8'));for(const [path,sha] of Object.entries(manifest.sha256))expect(createHash('sha256').update(readFileSync(path)).digest('hex'),path).toBe(sha);const js=readFileSync('public/engine-headless/doom.cjs','utf8');for(const name of ['reset','step','observe','outcome'])expect(js).toContain('_tremor_agent_'+name);expect(js).not.toContain('_tremor_agent_fixture');expect(readFileSync('index.html','utf8')).toContain('Music and sound effects use the loaded WAD.');});
