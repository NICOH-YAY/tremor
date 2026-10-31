// Presentation-only mix: normalized fear/pressure, slider 0..100.
const unit=x=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
export const HORROR_AUDIBLE_FLOOR=.7;
export function musicMix(style,fear,pressure,musicVolume){
 const f=unit(fear),p=unit(pressure),v=unit(musicVolume/100),dark=style==='layered'?f:0;
 return {oplGain:style==='horror'?0:v*(1-.22*Math.max(0,(dark-.65)/.35)),horrorGain:style==='original'?0:v*(1+f*.7+p*.35),horrorCutoff:1400+f*400+p*200,oplCutoff:18000-dark*15500,pitch:2**(-dark*45/1200),tension:unit((f-.3)/.7+p*.2)};
}
// Fixed storage and fractional phase across OPL blocks; no engine rate resets.
export function createOPLStream(render){
 const samples=new Float32Array(4096);let index=2048,phase=0,left=0,right=0,primed=false;
 function refill(){const b=render(2048);for(let i=0;i<4096;i++)samples[i]=b[i]/32768;index=0;}
 function advance(){if(index===2048)refill();left=samples[index*2];right=samples[index*2+1];index++;}
 return (l,r,pitch)=>{if(!primed){advance();primed=true;}for(let j=0;j<l.length;j++){if(index===2048)refill();const i=index*2;l[j]=left+(samples[i]-left)*phase;r[j]=right+(samples[i+1]-right)*phase;phase+=pitch;while(phase>=1){phase-=1;advance();}}};
}
