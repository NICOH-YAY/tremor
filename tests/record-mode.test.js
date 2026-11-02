import {test,expect} from 'vitest';
import {readFileSync} from 'node:fs';
test.each(['public/record-mode.js','public/record-audio.js'])('%s parses as a browser module',path=>{
 const source=readFileSync(path,'utf8').replace(/^import .*;\r?\n/gm,'').replace(/export /g,'');
 expect(()=>new Function(source)).not.toThrow();
});
