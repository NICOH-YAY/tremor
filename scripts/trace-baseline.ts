import {mkdirSync,writeFileSync} from 'node:fs';
import {baseline} from '../src/agent/baselines';
import {reset,observe,step,outcome,ACTION_IDS} from '../src/player_interface';
// Diagnostic harness only. Controllers receive exactly Observation and legal IDs.
const careful=!process.argv.includes('--aggressive'),level=process.argv.find(a=>/^E1M\d$/.test(a))??'E1M1';
const seed=Number(process.env.TRACE_SEED??1),label=`${level}-${seed}-${careful?'careful':'aggressive'}`;
const state=reset(seed,level),bot=baseline(careful),lines:string[]=[];
mkdirSync('eval/diagnostics',{recursive:true});
let health=100,objective='',lastMap=-100;
function render(index:number){
 const o=observe(state),rows=o.automap.split('\n'),n=rows.length;
 const colors:Record<string,string>={'#':'#8090a0','.':'#293941','?':'#080c10',D:'#f4b183',d:'#707070',S:'#ffe080',T:'#b393e8',b:'#368cff',y:'#ffe050',r:'#ff5050'};
 const rects:string[]=[];
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const c=rows[y][x];if(c==='?')continue;rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${colors[c]??'#69ff87'}"/>`);}
 const title=`${label} step ${index}, health ${o.health}, ${o.objective}, bearing ${o.objective_bearing}, ${o.objective_distance}`;
 writeFileSync(`eval/diagnostics/${label}-${index}-map.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="771" height="811" viewBox="0 0 ${n} ${n+14}"><title>${title}</title><rect width="100%" height="100%" fill="#080c10"/><g shape-rendering="crispEdges">${rects.join('')}</g><text x="2" y="${n+5}" fill="white" font-size="3">${title}</text><text x="2" y="${n+10}" fill="white" font-size="3">Green: player. D: orange door; S: yellow switch; T: purple crossing; keys: blue/yellow/red.</text></svg>`);
 const cell=rows.join('').search(/[>^<v]/),x=cell%n,y=Math.floor(cell/n);
 writeFileSync(`eval/diagnostics/${label}-${index}-map.txt`,rows.slice(Math.max(0,y-35),y+36).map(r=>r.slice(Math.max(0,x-35),x+36)).join('\n'));
 lastMap=index;
}
let index=0;
for(;index<1800&&!outcome(state).done;index++){
 const o=observe(state),{action}=await bot.decide(o,[...ACTION_IDS]);
 lines.push(JSON.stringify({step:index,action,health:o.health,rounds:o.rounds,objective:o.objective,bearing:o.objective_bearing,distance:o.objective_distance,heading:o.heading_deg,motion:o.motion,terror:o.terror,entities:o.entities}));
 if(index%50===0||objective!==o.objective||(health>o.health||o.motion==='blocked')&&index-lastMap>=10)render(index);
 health=o.health;objective=o.objective;step(state,action);
}
render(index);
const end=outcome(state);lines.push(JSON.stringify({end}));
writeFileSync(`eval/diagnostics/${label}-trace.jsonl`,lines.join('\n')+'\n');
console.log(JSON.stringify({label,steps:index,end},null,2));
