import {test, expect} from 'vitest';
import {execFileSync} from 'node:child_process';
import {hash, tree} from '../scripts/upstream-patch.mjs';
test('vendored engine patch is current',()=>{execFileSync(process.execPath,['scripts/upstream-patch.mjs','--check']);});
test('snapshot ignores text line endings, enumeration order and Windows separators',()=>{
 const paths=['engine/doomgeneric/LICENSE','engine/doomgeneric/README.TXT','engine/doomgeneric/doomgeneric.sln','engine/doomgeneric/project.vcxproj','engine/doomgeneric/project.vcxproj.filters','engine/doomgeneric/source.c'];
 const lf=tree(paths,()=>Buffer.from('first\nsecond\n'));
 const crlf=tree([...paths].reverse().map(p=>p.replaceAll('/',String.fromCharCode(92))),p=>{
  expect(paths).toContain(p);
  return Buffer.from('first\r\nsecond\r\n');
 });
 expect(JSON.stringify(crlf)).toBe(JSON.stringify(lf));
 expect(hash(Buffer.from('diff --git a/file b/file\r\n+change\r\n'))).toBe(hash(Buffer.from('diff --git a/file b/file\n+change\n')));
 expect(hash(Buffer.from('changed\n'))).not.toBe(hash(Buffer.from('original\n')));
});
test('binary bytes remain significant',()=>{
 expect(hash(Buffer.from([0,13,10]))).not.toBe(hash(Buffer.from([0,10])));
});
