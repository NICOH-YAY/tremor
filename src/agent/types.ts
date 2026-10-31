import type { Observation } from '../player_interface';
export interface Decision {action:string;error?:string;reason?:string;tokensIn?:number;tokensOut?:number;usageKnown?:boolean}
export interface Controller {id:string;model?:boolean;mocked?:boolean;decide(observation:Observation,legal:readonly string[],feedback?:string,signal?:AbortSignal):Promise<Decision>}
