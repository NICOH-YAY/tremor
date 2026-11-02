// cwd: project root. Generation-only dependency path is supplied explicitly.
// npm install --prefix <tool directory> @echogarden/espeak-ng-emscripten@0.3.5
import {pathToFileURL} from 'node:url';
import {readFileSync,writeFileSync} from 'node:fs';
if(!process.env.ESPEAK_MODULE)throw Error('Set ESPEAK_MODULE to espeak-ng.js from @echogarden/espeak-ng-emscripten@0.3.5');
const {default:create}=await import(pathToFileURL(process.env.ESPEAK_MODULE).href);
const m=await create(),w=new m.eSpeakNGWorker();w.set_rate(145);w.set_pitch(30);
for(const line of JSON.parse(readFileSync('public/radio/lines.json'))){
 const chunks=[];w.synthesize(line.text,data=>{chunks.push(Buffer.from(data.buffer,data.byteOffset,data.byteLength));return false;});
 const pcm=Buffer.concat(chunks),h=Buffer.alloc(44),rate=w.get_samplerate();h.write('RIFF');h.writeUInt32LE(36+pcm.length,4);h.write('WAVEfmt ',8);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(rate,24);h.writeUInt32LE(rate*2,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(pcm.length,40);writeFileSync(`public/radio/${line.id}.wav`,Buffer.concat([h,pcm]));
}
