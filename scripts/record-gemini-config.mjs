import {readFile,writeFile,appendFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const report='eval/results/2026-10-31-2026-10-31T06-19-01-385Z-results.json';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function committed(path){const bytes=await readFile(path),head=execFileSync('git',['show',`HEAD:${path}`],{maxBuffer:200*1024*1024});if(!bytes.equals(head))throw Error('Not identical to committed source: '+path);return bytes;}
export async function prepare(){
 await committed(report);
 const demo=JSON.parse(await committed('eval/demo/replay.json'));
 await committed('eval/demo/'+demo.file);
 const manifest=JSON.parse(await committed('public/replays/manifest.json'));
 const entry=manifest.find(x=>x.file===demo.file);
 if(!entry||JSON.stringify(entry.terminal)!==JSON.stringify(demo.terminal)||entry.sha256!==demo.sha256)throw Error('Demo manifest differs from committed terminal record');
 const published=await committed('public/replays/'+demo.file);if(sha(published)!==demo.sha256)throw Error('Demo hash mismatch');
 await writeFile('dist/replays/results.json',await committed(report));
}
export async function document(info){
 if(info.verified?.length!==1||info.verified.some(x=>x.badge!=='Replay verified'))throw Error('Missing verified badges');
 if(info.duration<180||info.duration>300)throw Error('Duration outside 3–5 minutes');
 for(const [name,level] of Object.entries(info.audioLevels))if(name.includes('/ 1x')&&level.rms<1e-6)throw Error('Silent replay section: '+name);
 await appendFile('recordings/README.md',`\n## Gemini-only recording / 2026-11-04\n\nRun \`npm run record:gemini\`. Separate recorder and config: \`scripts/record-gemini.mjs\`, \`scripts/record-gemini-config.mjs\`; the original \`record:video\` is unchanged. Sources must match Git HEAD byte-for-byte. The config stages the committed results into dist only; no model calls or action edits.\n\nContent: 10 s title describing Gemini, its public observations and limits; 260 s of the model-history demo (E1M1, seed 17) at 1x with verbatim reasons; labelled 2 s skip cut executing every remaining action and 5 s verified timeout ending; 10 s honest results card. The segment is labelled a deterministic replay with map, seed, condition and terminal reason throughout. The committed declared suite reports 0/14 exits for history and 0/14 for observation-only. History: 6 deaths and 8 timeouts; observation-only: 7 deaths and 7 timeouts. The shown demo ends at the five-minute cap. Demo is excluded. E1M6/E1M7 local traces are uncommitted and excluded under the committed-source requirement. Source: ${report}.\n\nOutput: ${info.file.split('/').pop()} (gitignored). Duration: ${info.duration.toFixed(3)} s; patched EBML Info Duration read back: ${info.headerDuration.toFixed(3)} s. Size: ${info.size} bytes. SHA-256: \`${info.sha256}\`. No Cues added.\n\nWatch-page badge: ${info.verified.map(x=>`${x.level} seed ${x.seed}: ${x.badge}`).join('; ')}. Terminal reason and all metrics reproduced.\n\nAudio: Opus present; offline decoded RMS ${info.encodedAudio.rms.toFixed(6)}, peak ${info.encodedAudio.peak.toFixed(6)}. Layered Freedoom OPL music, horror score, engine SFX and radio share the captured master; OPL peak ${info.audio.oplPeak}, SFX starts ${info.audio.sfx}, radio clips ${info.audio.radio}. Audio routes only through the analyser to MediaStreamAudioDestinationNode, with Edge --mute-audio; no speaker connection. Title silence is intentional.\n\nPer-section captured bus levels:\n\n${Object.entries(info.audioLevels).map(([name,v])=>`- ${name}: peak ${v.peak.toFixed(6)}, RMS ${v.rms.toFixed(6)}`).join('\n')}\n\nFrame delivery: ${info.frames} animation frames; ${info.longFrames} gaps over 50 ms; largest gap ${info.maxGapMs.toFixed(1)} ms. Requested 30 fps at 1920x1080, VP9/Opus, 7.5 Mbps video / 192 kbps audio; renderer timing is not a guarantee of every encoded frame. Captured in real time using installed Edge (${info.mode}).\n`);
}
