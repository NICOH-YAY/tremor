import {test,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
// Hash raw bytes after the generator canonicalizes manifest-listed text to LF.
test('every manifest-listed text file contains only LF line endings',()=>{
 const manifest=JSON.parse(readFileSync('public/engine-headless/artifacts.json','utf8'));
 for(const path of Object.keys(manifest.sha256).filter(path=>/\.(?:js|cjs|json|c|h)$/.test(path)))
  expect(readFileSync(path,'utf8'),path).not.toContain('\r');
});
test('generated JavaScript preserves build LF bytes',()=>{for(const path of ['public/engine/doom.js','public/engine-headless/doom.cjs','public/engine-headless/doom-test.cjs'])expect(readFileSync(path,'utf8'),path).not.toContain('\r\n');});
test('browser diagnostic setters are absent from both agent artifacts',()=>{
 for(const target of ['doom','doom-test']){
  const js=readFileSync(`public/engine-headless/${target}.cjs`,'utf8');
  for(const name of ['tremor_debug_terror','tremor_debug_rounds','tremor_debug_warp'])expect(js).not.toContain(name);
 }
});
test('shipped headless artifacts match manifest and production omits privileged fixtures',()=>{const manifest=JSON.parse(readFileSync('public/engine-headless/artifacts.json','utf8'));for(const [path,sha] of Object.entries(manifest.sha256))expect(createHash('sha256').update(readFileSync(path)).digest('hex'),path).toBe(sha);const js=readFileSync('public/engine-headless/doom.cjs','utf8');for(const name of ['reset','step','observe','outcome'])expect(js).toContain('_tremor_agent_'+name);expect(js).not.toContain('_tremor_agent_fixture');expect(readFileSync('index.html','utf8')).toContain('Music and sound effects use the loaded WAD.');});
