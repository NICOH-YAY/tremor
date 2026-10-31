import type {Observation} from '../player_interface';
import {RULES} from './model_rules';
export interface EncodedMap {encoding:'row-rle';width:number;height:number;x:number;y:number;rows:string[];trailingNewline:boolean}
export function encodeMap(map:string):EncodedMap {
 const trailingNewline=map.endsWith('\n'),all=map.split('\n');if(trailingNewline)all.pop();
 const height=all.length,width=all[0]?.length??0;let x=width,y=height,right=-1,bottom=-1;
 all.forEach((row,j)=>[...row].forEach((c,i)=>{if(c!=='?'){x=Math.min(x,i);y=Math.min(y,j);right=Math.max(right,i);bottom=Math.max(bottom,j);}}));
 const rows=all.slice(y,bottom+1).map(row=>(row.slice(x,right+1).match(/(.)\1*/g)??[]).map(run=>run[0]+run.length).join(' '));
 return {encoding:'row-rle',width,height,x:rows.length?x:0,y:rows.length?y:0,rows,trailingNewline};
}
export function decodeMap(m:EncodedMap):string {
 const rows=Array.from({length:m.height},()=>'?'.repeat(m.width));
 m.rows.forEach((row,j)=>{const decoded=row.split(' ').map(run=>run[0].repeat(Number(run.slice(1)))).join('');rows[m.y+j]='?'.repeat(m.x)+decoded+'?'.repeat(m.width-m.x-decoded.length);});
 return rows.join('\n')+(m.trailingNewline?'\n':'');
}
export function compactObservation(o:Observation){const {summary:_,automap,...fields}=o;return {...fields,automap:encodeMap(automap)};}
// Reverse patches retain every prior field and map, anchored to the current view.
export function reverseDelta(newer:Observation,older:Observation){
 const {summary:_,automap:__,...fields}=older;const changed=Object.fromEntries(Object.entries(fields).filter(([k,v])=>JSON.stringify(v)!==JSON.stringify(newer[k as keyof Observation])));
 const cells:Array<[number,string]>=[];let i=0;while(i<older.automap.length){if(older.automap[i]===newer.automap[i]){i++;continue;}const start=i;while(i<older.automap.length&&older.automap[i]!==newer.automap[i])i++;cells.push([start,older.automap.slice(start,i)]);}
 return {fields:changed,mapLength:older.automap.length,mapPatches:cells};
}
export function buildPrompt(o:Observation,legal:readonly string[],history:{o:Observation;action:string}[],feedback=''){
 let newer=o;const reverse=history.slice(-8).reverse().map(entry=>{const delta=reverseDelta(newer,entry.o);newer=entry.o;return {action:entry.action,...delta};});
 return [RULES,`Legal: ${legal.join(',')}`,`Current: ${JSON.stringify(compactObservation(o))}`,`History newest to oldest: ${JSON.stringify(reverse)}`,`Validation feedback: ${feedback||'none'}`].join('\n');
}
