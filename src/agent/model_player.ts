import { GoogleGenAI } from '@google/genai';
import type { Controller } from './types';
const RULES='Play Tremor in the real Doom engine on Freedoom Episode 1. Reach a level exit, survive. Crew never attack. Unknown figure hides whether a human is crew or possessed. Hold read for five consecutive actions (35 tics) on an aimed human to identify them. Stun at <=64 Doom units, then five consecutive purge actions on a stunned possessed human to save them (two charges). Crew need no purge. Demons use Doom names and are hostile. Actions take seven 35Hz tics (0.2s); small turns total10 degrees, fine turns2, large turns90. Compound _fire and _read actions hold those inputs while turning/moving. Bearings are positive LEFT, negative RIGHT. Distances are Doom map units. Fire at bearing near zero. If out of rounds select weapon_fist and approach melee range. Map is a257x257 north-up viewport with16 Doom units per cell: ? unknown, . previously visible floor, # mapped barrier, D closed manual door, d open passage (do not close it), S mapped switch, T mapped crossing activation, b/y/r closed blue/yellow/red locks, >^<v the player marker. The viewport recenters near its edge; no world coordinates or unvisited lines are supplied. heading_deg numerically describes the visible arrow; elevation_deg describes an entity position above/below the view. motion is the visible moving/blocked/still cue. weapons is the HUD inventory. The bounded episode radio log is also accessible to humans. Use opens nearby doors and activates exit switches. Only supplied observations and legal actions are available. Return JSON {"action":"legal id","reason":"brief reason"}.';
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


