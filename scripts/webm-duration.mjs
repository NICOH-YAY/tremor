// MediaRecorder emits an unknown-size Segment without a seek index. Preserve all
// encoded tracks/clusters; insert Duration in Info using its TimecodeScale.
function vint(bytes, offset, id=false){
 let width=1;while(width<=8&&!(bytes[offset]&(0x80>>(width-1))))width++;
 if(width>8||offset+width>bytes.length)throw Error('Invalid EBML integer');
 let value=id?bytes[offset]:bytes[offset]&((0x80>>(width-1))-1);
 let unknown=!id&&value===((0x80>>(width-1))-1);
 for(let i=1;i<width;i++){value=value*256+bytes[offset+i];unknown&&=bytes[offset+i]===255;}
 return {width,value,unknown};
}
function elements(bytes,start=0,end=bytes.length){
 const out=[];for(let offset=start;offset<end;){const id=vint(bytes,offset,true),size=vint(bytes,offset+id.width);const data=offset+id.width+size.width,stop=size.unknown?end:data+size.value;if(stop>end)throw Error('Truncated EBML');out.push({id:id.value,offset,data,end:stop,idWidth:id.width});offset=stop;}return out;
}
function sizeBytes(n){for(let w=1;w<=8;w++)if(n<2**(7*w)-1){const b=Buffer.alloc(w);let v=n;for(let i=w-1;i>=0;i--){b[i]=v%256;v=Math.floor(v/256);}b[0]|=0x80>>(w-1);return b;}throw Error('EBML size overflow');}
function info(bytes){const segment=elements(bytes).find(e=>e.id===0x18538067);if(!segment)throw Error('Missing Segment');const children=elements(bytes,segment.data,segment.end),entry=children.find(e=>e.id===0x1549a966);if(!entry)throw Error('Missing Info');const fields=elements(bytes,entry.data,entry.end);const scale=fields.find(e=>e.id===0x2ad7b1);let ns=1000000;if(scale){ns=0;for(const x of bytes.subarray(scale.data,scale.end))ns=ns*256+x;}return {segment,children,entry,fields,ns};}
export function readWebmDuration(bytes){const {fields,ns}=info(bytes),d=fields.find(e=>e.id===0x4489);if(!d)throw Error('Missing Duration');const n=d.end-d.data;return (n===8?bytes.readDoubleBE(d.data):n===4?bytes.readFloatBE(d.data):NaN)*ns/1e9;}
export function fixWebmDuration(bytes,seconds){
 if(!Number.isFinite(seconds)||seconds<=0)throw Error('Invalid duration');
 const {segment,children,entry,fields,ns}=info(bytes);
 // Existing indexes would need their offsets rebuilt after expanding Info.
 if(children.some(e=>e.id===0x114d9b74||e.id===0x1c53bb6b))throw Error('Indexed WebM requires index rebuild');
 const value=Buffer.alloc(8);value.writeDoubleBE(seconds*1e9/ns);
 const payload=Buffer.concat([...fields.filter(e=>e.id!==0x4489).map(e=>bytes.subarray(e.offset,e.end)),Buffer.from([0x44,0x89,0x88]),value]);
 const newInfo=Buffer.concat([bytes.subarray(entry.offset,entry.offset+entry.idWidth),sizeBytes(payload.length),payload]);
 const body=Buffer.concat([bytes.subarray(segment.data,entry.offset),newInfo,bytes.subarray(entry.end,segment.end)]);
 // Unknown size remains legal; retaining it avoids shifting the Segment header.
 const result=Buffer.concat([bytes.subarray(0,segment.offset+segment.idWidth),Buffer.from([1,255,255,255,255,255,255,255]),body]);
 if(Math.abs(readWebmDuration(result)-seconds)>.001)throw Error('Duration readback failed');
 return result;
}
