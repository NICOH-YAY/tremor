import { GoogleGenAI } from '@google/genai';
import type { Controller } from './types';
import {buildPrompt} from './prompt';
import {MODEL_CONFIG} from '../eval/model_config';
import type {Observation} from '../player_interface';
type Generate=(request:Parameters<GoogleGenAI['models']['generateContent']>[0])=>Promise<{text?:string;usageMetadata?:{promptTokenCount?:number;candidatesTokenCount?:number;thoughtsTokenCount?:number}}>;
export function modelPlayer(memory:'history'|'obs-only',generate?:Generate):Controller {
 const project=process.env.GOOGLE_CLOUD_PROJECT;
 if(!generate&&!project)throw new Error('GOOGLE_CLOUD_PROJECT is required for live Vertex');
 if(process.env.GOOGLE_CLOUD_LOCATION&&process.env.GOOGLE_CLOUD_LOCATION!==MODEL_CONFIG.location)throw new Error('Evaluation requires global Vertex location');
 const history:{o:Observation;action:string}[]=[];
 const request=generate??((r)=>new GoogleGenAI({vertexai:true,project,location:MODEL_CONFIG.location}).models.generateContent(r));
 return {id:`model-${memory}`,model:true,async decide(o,legal,feedback,signal){
 const prompt=buildPrompt(o,legal,memory==='history'?history:[],feedback);
 if(prompt.length>MODEL_CONFIG.maxPromptChars)return {action:'',error:'lossless prompt exceeds character preflight budget',tokensIn:0,tokensOut:0,usageKnown:true};
 const response=await request({model:MODEL_CONFIG.model,contents:prompt,config:{temperature:MODEL_CONFIG.temperature,maxOutputTokens:MODEL_CONFIG.maxOutputTokens,responseMimeType:'application/json',httpOptions:{timeout:20000,retryOptions:{attempts:1}},abortSignal:signal}});
 const usage={usageKnown:response.usageMetadata?.promptTokenCount!==undefined&&response.usageMetadata?.candidatesTokenCount!==undefined,tokensIn:response.usageMetadata?.promptTokenCount??0,tokensOut:(response.usageMetadata?.candidatesTokenCount??0)+(response.usageMetadata?.thoughtsTokenCount??0)};
 let parsed:{action?:unknown;reason?:unknown}={};try{const candidate:unknown=JSON.parse(response.text??'{}');if(candidate&&typeof candidate==='object')parsed=candidate as typeof parsed;}catch{}
 const action=typeof parsed.action==='string'?parsed.action:'';
 history.push({o:structuredClone(o),action});if(history.length>8)history.shift();
 if(!action)return {action:'',error:'invalid model response',...usage};
 return {action,reason:typeof parsed.reason==='string'?parsed.reason:'',...usage};
 }};
}
