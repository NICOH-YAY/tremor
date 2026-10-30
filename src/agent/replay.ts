import type { Controller } from './types';
export function replay(actions:readonly {action:string}[]):Controller {let i=0;return {id:'replay-mocked',mocked:true,async decide(){return {action:actions[i++]?.action??'wait',reason:'mocked recorded action'};}};}
