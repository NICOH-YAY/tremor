import { GoogleGenAI } from '@google/genai';
import type { Controller } from './types';
const RULES='Play Tremor. Reach the exit E, survive, read unknown figures before deciding to fire. Crew are not hostile. Possessed can be stunned nearby then purged with a charge; ember and hound are hostile. Actions take 7 tics (0.2s). read takes about 35 tics. Small turns 35 degrees, large turns 90 degrees. Map: ? unseen, # wall, . floor, D door (use nearby), K visible key, >v<^ you facing east/south/west/north. Aim at figures near bearing 0. Return JSON {"action":"legal id","reason":"brief reason"}.';
export function modelPlayer(memory:'history'|'obs-only'):Controller {
 const project=process.env.GOOGLE_CLOUD_PROJECT;if(!project)throw new Error('GOOGLE_CLOUD_PROJECT is required for live Vertex');
 const history:string[]=[];
 let location=process.env.GOOGLE_CLOUD_LOCATION??'global';
 return {id:`model-${memory}`,model:true,async decide(o,legal,feedback,signal){
 const prompt=[RULES,`Legal: ${legal.join(',')}`,memory==='history'?history.slice(-8).join('\n'):'',`Current: ${o.summary}`,`Validation feedback: ${feedback??'none'}`].join('\n');
 const request=()=>new GoogleGenAI({vertexai:true,project,location}).models.generateContent({model:'gemini-3.5-flash-lite',contents:prompt,config:{responseMimeType:'application/json',httpOptions:{timeout:20000,retryOptions:{attempts:1}},abortSignal:signal}});
 let response;try{response=await request();}catch(error){if(location==='global'&&/404|not found|location|unsupported/i.test(String(error))){location='us-central1';throw new Error('Global Vertex unavailable; failed call counted, next call uses us-central1', {cause:error});}else throw error;}
 let parsed:{action?:unknown;reason?:unknown}={};try{const candidate:unknown=JSON.parse(response.text??'{}');if(candidate&&typeof candidate==='object')parsed=candidate as typeof parsed;}catch{parsed={reason:'invalid JSON response'};}
 const action=typeof parsed.action==='string'?parsed.action:'';
 if(!action) return {action:'',error:'invalid model response',tokensIn:response.usageMetadata?.promptTokenCount??0,tokensOut:response.usageMetadata?.candidatesTokenCount??0};
 history.push(`${o.summary}\nAction: ${action}`);if(history.length>8)history.shift();
 return {action,reason:typeof parsed.reason==='string'?parsed.reason:'',tokensIn:response.usageMetadata?.promptTokenCount??0,tokensOut:response.usageMetadata?.candidatesTokenCount??0};
 }};
}


