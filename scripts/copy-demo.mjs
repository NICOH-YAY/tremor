import {readFile,writeFile,copyFile} from 'node:fs/promises';
const meta=JSON.parse(await readFile('eval/demo/replay.json','utf8'));
if(meta.label!=='demo, not part of the declared suite'||meta.file!=='demo-model-history-E1M1-17.jsonl.gz')throw Error('Unexpected demo metadata');
await copyFile('eval/demo/'+meta.file,'public/replays/'+meta.file);
const path='public/replays/manifest.json',manifest=JSON.parse(await readFile(path,'utf8')).filter(row=>row.file!==meta.file);
manifest.push(meta);await writeFile(path,JSON.stringify(manifest,null,2)+'\n');
