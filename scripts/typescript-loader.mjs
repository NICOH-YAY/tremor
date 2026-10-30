// Node 24 native TypeScript loading with extensionless local module resolution.
import {registerHooks,stripTypeScriptTypes} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
registerHooks({
 resolve(specifier,context,next){
  if(specifier.startsWith('.')&&context.parentURL){const url=new URL(specifier,context.parentURL);for(const suffix of ['.ts','/index.ts']){const candidate=new URL(url.href+suffix);if(existsSync(candidate))return next(candidate.href,context);}}
  return next(specifier,context);
 },
 load(url,context,next){if(url.endsWith('.ts'))return {format:'module',source:stripTypeScriptTypes(readFileSync(fileURLToPath(url),'utf8'),{mode:'transform',sourceUrl:url}),shortCircuit:true};return next(url,context);}
});
