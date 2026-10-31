import {MODEL_CONFIG,PRICING} from '../src/eval/model_config';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import { mkdir,writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {unlink} from 'node:fs/promises';
import { ALL_CASES,SUITE } from '../src/eval/suite';
import { runEpisode } from '../src/eval/runner';
import { baseline } from '../src/agent/baselines';
import { modelPlayer } from '../src/agent/model_player';
let revision='unknown',workingTree='unknown';
try{revision=execFileSync('git',['-c','safe.directory='+process.cwd(),'rev-parse','HEAD'],{encoding:'utf8'}).trim();workingTree=execFileSync('git',['-c','safe.directory='+process.cwd(),'status','--porcelain'],{encoding:'utf8'}).trim()?'dirty':'clean';}catch{}
const args=process.argv.slice(2),value=(key:string,fallback:string)=>args[args.indexOf(key)+1]??fallback;
const players=args.includes('--players')?value('--players','').split(','):['baseline_aggressive','baseline_careful','model-history','model-obs-only'];
const chosen=args.includes('--cases')?value('--cases','all'):'all';
const cases=chosen==='all'?[...ALL_CASES]:chosen.split(',');
for(const id of cases)if(!/^E1M[1-9]$/.test(id))throw new Error(`Engine level missing: ${id}.`);
const date=new Date().toISOString().slice(0,10),runId=new Date().toISOString().replace(/[:.]/g,'-');
const controllerSources=Object.fromEntries(['src/agent/baselines.ts','src/agent/model_player.ts','src/agent/model_rules.ts','src/agent/prompt.ts','src/eval/model_config.ts','src/player_interface.ts','src/eval/runner.ts'].map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]));
const artifacts=Object.fromEntries(['public/engine-headless/doom.cjs','public/engine-headless/doom.wasm','public/wad/freedoom1.wad','public/wad/tremor.wad'].map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]));
const results=[],skipped:string[]=[];
for(const player of players){
 if(player.startsWith('model-')&&!args.includes('--live')){console.log(`Skipping ${player}: Vertex requires --live; no substitute used.`);skipped.push(player);continue;}
 if(!['baseline_aggressive','baseline_careful','model-history','model-obs-only'].includes(player))throw new Error(`Unknown player ${player}`);
 for(const levelId of cases)for(const seed of SUITE.seeds){
 const controller=player.startsWith('model-')?modelPlayer(player==='model-history'?'history':'obs-only'):baseline(player==='baseline_careful');
 const tracePath=`eval/traces/${runId}-${player}-${levelId}-${seed}.jsonl`;
 const {trace,...result}=await runEpisode(controller,{seed,levelId,tracePath});
 // Large public automap histories compress well; retain every action/observation.
 await writeFile(tracePath+'.gz',gzipSync(readFileSync(tracePath),{level:1}));
 await unlink(tracePath);
 results.push({...result,split:SUITE.tuning.some(id=>id===levelId)?'tuning':SUITE.seen.some(id=>id===levelId)?'seen':'held-out',tracePath:tracePath+'.gz'});console.log(`${player} ${levelId} ${seed}: ${result.reason}`);
 }}
await mkdir('eval/results',{recursive:true});
const config={stepTics:7,maxSteps:600,maxCalls:600,timeoutMs:20000,maxDurationMs:300000,historyK:8,promptEncoding:'lossless-row-rle-reverse-delta-v1',...MODEL_CONFIG};
const configId=createHash('sha256').update(JSON.stringify({config,suite:SUITE,controllerSources,artifacts})).digest('hex');
const report={artifacts,controllerSources,date,runId,configId,gameVersion:artifacts['public/engine-headless/doom.wasm'],revision,workingTree,model:players.some(p=>p.startsWith('model-')&&!skipped.includes(p))?MODEL_CONFIG.model:null,config,suite:SUITE,skipped,pricing:PRICING,results};
await writeFile(`eval/results/${date}-${runId}-results.json`,JSON.stringify(report,null,2));
const table=['| Player | Case | Split | Seed | Completion | Reason | Steps | Illegal | Calls | Crew killed/saved | Reads | Fired unread | Trauma / terror | ms | Tokens in/out | Est. cost |','|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|',...results.map(r=>`| ${r.player} | ${r.levelId} | ${r.split} | ${r.seed} | ${r.reachedExit} | ${r.reason} | ${r.steps} | ${r.illegalActions} | ${r.modelCalls} | ${r.crewKilled}/${r.crewSaved} | ${r.reads} | ${r.firedUnread} | ${r.finalTremor} / ${r.finalTerrorBucket} | ${Math.round(r.latencyMs)} | ${r.tokensIn}/${r.tokensOut} | ${r.estimatedCost===null?'unverified':r.estimatedCost} |`)];
await writeFile(`eval/results/${date}-${runId}-table.md`,`${date}; ${revision}\n\n${table.join('\n')}\n\nSkipped: ${skipped.join(', ')||'none'}. Cost: ${JSON.stringify(report.pricing)}.\n`);

