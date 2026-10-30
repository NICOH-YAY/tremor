import { appendFile, mkdir } from 'node:fs/promises';
import { observe,legal_actions,step,outcome,reset,terminate } from '../player_interface';
import type { Controller,Decision } from '../agent/types';
export interface EpisodeOptions {seed:number;levelId:string;maxSteps?:number;maxCalls?:number;timeoutMs?:number;maxDurationMs?:number;tracePath?:string|false}
export async function runEpisode(controller:Controller,options:EpisodeOptions){
 const tracePath=options.tracePath===false?undefined:options.tracePath??`eval/traces/${Date.now()}-${crypto.randomUUID()}.jsonl`;
 const world=reset(options.seed,options.levelId),trace:Record<string,unknown>[]=[];
 const episodeStart=performance.now(),maxDurationMs=options.maxDurationMs??300000;
 const maxSteps=options.maxSteps??400,maxCalls=options.maxCalls??400;let steps=0,calls=0,invalid=0,errors=0,unknownUsageCalls=0,consecutive=0,fallbacks=0,feedback='',tokensIn=0,tokensOut=0,latencyMs=0;
 async function record(row:Record<string,unknown>){trace.push(row);if(tracePath)await appendFile(tracePath,JSON.stringify(row)+'\n');}
 if(tracePath){await mkdir(tracePath.replace(/[\\/][^\\/]+$/,''),{recursive:true});await (await import('node:fs/promises')).writeFile(tracePath,'');}
 while(!outcome(world).done){
 if(performance.now()-episodeStart>=maxDurationMs){terminate(world,'timeout');break;}
 if(steps>=maxSteps){terminate(world,'step_limit');break;}if(calls>=maxCalls){terminate(world,'call_limit');break;}
 const observation=observe(world),legal=legal_actions(world),start=performance.now(),abort=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined,decision:Decision|undefined,error='',timeout=false;
 calls++;
 try{decision=await Promise.race([controller.decide(structuredClone(observation),[...legal],feedback,abort.signal),new Promise<never>((_,reject)=>{timer=setTimeout(()=>{timeout=true;abort.abort();reject(new Error('controller timeout'));},Math.max(1,Math.min(options.timeoutMs??20000,maxDurationMs-(performance.now()-episodeStart))));})]);}catch(e){error=String(e);}finally{clearTimeout(timer);}
 const latency=performance.now()-start;latencyMs+=latency;tokensIn+=decision?.tokensIn??0;tokensOut+=decision?.tokensOut??0;
 if(error||decision?.error){errors++;if(!decision)unknownUsageCalls++;}
 if(timeout){await record({step:steps,observation:observation.summary,action:null,source:'error',valid:false,latencyMs:latency,tokensIn:0,tokensOut:0,error});terminate(world,'timeout');break;}
 const action=decision?.action??'',result=decision&&!decision.error?step(world,'player',action):null;
 const valid=result?.valid??false;feedback=result?.reason??(error||decision?.error||'');
 if(result&&!valid){invalid++;consecutive++;}else consecutive=0;
 // Failed calls consume call budget but do not advance the world.
 if(result)steps++;
 await record({step:steps,observation:observation.summary,action,source:!result?'error':controller.mocked?'replay-mocked':controller.model?'model':'baseline',valid,feedback,latencyMs:latency,tokensIn:decision?.tokensIn??0,tokensOut:decision?.tokensOut??0});
 if(consecutive>=3&&!outcome(world).done&&steps<maxSteps){const beforeFallback=observe(world).summary;step(world,'player','wait');steps++;fallbacks++;consecutive=0;await record({step:steps,observation:beforeFallback,action:'wait',source:'fallback',valid:true,latencyMs:0,tokensIn:0,tokensOut:0});}
 }
 return {player:controller.id,mocked:!!controller.mocked,seed:options.seed,levelId:options.levelId,...outcome(world),steps,illegalActions:invalid,errors,unknownUsageCalls,modelCalls:controller.model?calls:0,controllerCalls:calls,fallbacks,modelMoves:trace.filter(r=>r.source==='model'&&r.valid===true).length,latencyMs,tokensIn,tokensOut,estimatedCost:null,trace};
}

