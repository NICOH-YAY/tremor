import {test,expect} from 'vitest';
import {createRecordedBus} from '../public/record-audio.js';
test('recording bus never connects to speaker destination',()=>{
 const edges=[];const node=name=>({name,gain:{value:0},connect(target){edges.push([this,target]);return target;}});
 const ac={destination:node('speakers'),createGain:()=>node('master'),createAnalyser:()=>node('analyser'),createMediaStreamDestination:()=>node('capture')};
 const {master,analyser,destination}=createRecordedBus(ac);
 expect(edges).toEqual([[master,analyser],[analyser,destination]]);
 expect(edges.some(([,target])=>target===ac.destination)).toBe(false);
});
