// Human-run demonstration only; never included in declared-suite reports.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {runEpisode} from '../src/eval/runner';
import {modelPlayer} from '../src/agent/model_player';
import {MODEL_CONFIG} from '../src/eval/model_config';
if(!process.argv.includes('--live'))throw Error('Live demo requires --live');
await mkdir('eval/demo',{recursive:true});
const {trace,...result}=await runEpisode(modelPlayer('history'),{seed:17,levelId:'E1M1',tracePath:'eval/demo/model-history-E1M1-17.jsonl'});
const file='demo-model-history-E1M1-17.jsonl.gz';
const decompressed=await readFile('eval/demo/model-history-E1M1-17.jsonl');
const bytes=gzipSync(decompressed);
await writeFile('eval/demo/'+file,bytes);
const config={...MODEL_CONFIG,historyK:8,maxSteps:600,maxCalls:600,timeoutMs:20000,maxDurationMs:300000,stepTics:7};
await writeFile('eval/demo/replay.json',JSON.stringify({file,sha256:createHash('sha256').update(bytes).digest('hex'),sha256Decompressed:createHash('sha256').update(decompressed).digest('hex'),player:'model-history',level:'E1M1',seed:17,skill:2,model:MODEL_CONFIG.model,configId:createHash('sha256').update(JSON.stringify(config)).digest('hex'),label:'demo, not part of the declared suite',terminal:{status:result.status,reason:result.reason,score:result.score,metrics:result.metrics},unknownUsageCalls:result.unknownUsageCalls,config,result},null,2)+'\n');
