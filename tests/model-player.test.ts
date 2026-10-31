import {expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {encodeMap,decodeMap,buildPrompt,reverseDelta} from '../src/agent/prompt';
import {modelPlayer} from '../src/agent/model_player';
import {ACTION_IDS,type Observation} from '../src/player_interface';
const rows=gunzipSync(readFileSync('eval/traces-sample/baseline-death.jsonl.gz')).toString().trim().split('\n').map(s=>JSON.parse(s));
const observations=rows.map(r=>{const o=JSON.parse(r.observation);return {...o,summary:r.observation} as Observation;});
it('losslessly encodes every recorded E1M1 map including unknown borders',()=>{
 for(const o of observations)expect(decodeMap(encodeMap(o.automap))).toBe(o.automap);
 expect(decodeMap(encodeMap('???\n???\n'))).toBe('???\n???\n');
});
it('recorded E1M1 prompts stay below 24000 characters with eight lossless history deltas',()=>{
 for(let i=0;i<observations.length;i++)expect(buildPrompt(observations[i],ACTION_IDS,observations.slice(Math.max(0,i-8),i).map(o=>({o,action:'wait'})),'').length).toBeLessThan(24000);
});
it('mocked model sends rules, legal IDs and compact map and preserves malformed usage',async()=>{
 const generate=vi.fn().mockResolvedValueOnce({text:'{"action":"wait"}',usageMetadata:{promptTokenCount:123,candidatesTokenCount:5}}).mockResolvedValueOnce({text:'oops',usageMetadata:{promptTokenCount:124,candidatesTokenCount:6}});
 const c=modelPlayer('history',generate);
 expect((await c.decide(observations[0],ACTION_IDS)).action).toBe('wait');
 const request=generate.mock.calls[0][0];expect(request.contents).toContain('Play Tremor');expect(request.contents).toContain('Legal:');expect(request.contents).toContain('row-rle');expect(request.config.temperature).toBe(0.2);
 expect(await c.decide(observations[1],ACTION_IDS)).toMatchObject({error:'invalid model response',tokensIn:124,tokensOut:6});
});

it('history reverse deltas reconstruct all original fields and maps',()=>{
 for(let i=1;i<observations.length;i++){
 const newer=observations[i],older=observations[i-1],delta=reverseDelta(newer,older);
 let map=newer.automap.slice(0,delta.mapLength).padEnd(delta.mapLength,'?');
 for(const [offset,text] of delta.mapPatches)map=map.slice(0,offset)+text+map.slice(offset+text.length);
 const {summary:_,...expected}=older;const {summary:__,...current}=newer;
 expect({...current,...delta.fields,automap:map}).toEqual(expected);
 }
});

it('rejects oversized lossless prompts before contacting the model',async()=>{
 const generate=vi.fn(),c=modelPlayer('obs-only',generate);
 const o={...observations[0],radio_log:'x'.repeat(24000)};
 expect(await c.decide(o,ACTION_IDS)).toMatchObject({error:'lossless prompt exceeds character preflight budget',tokensIn:0,tokensOut:0,usageKnown:true});
 expect(generate).not.toHaveBeenCalled();
});
