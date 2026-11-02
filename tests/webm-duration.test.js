import {test,expect} from 'vitest';
import {fixWebmDuration,readWebmDuration} from '../scripts/webm-duration.mjs';
const sample=()=>Buffer.from('1853806701ffffffffffffff1549a966872ad7b1830f42401f43b67583e78100','hex');
test('WebM duration patch adds and replaces Info Duration, preserves encoded clusters',()=>{
 const original=sample(),fixed=fixWebmDuration(original,248.187);
 expect(readWebmDuration(fixed)).toBeCloseTo(248.187,6);
 expect(fixed.subarray(-8)).toEqual(original.subarray(-8));
 expect(readWebmDuration(fixWebmDuration(fixed,12.5))).toBe(12.5);
});
test('WebM duration patch rejects malformed input and invalid durations',()=>{
 expect(()=>fixWebmDuration(Buffer.from([0]),1)).toThrow();
 expect(()=>fixWebmDuration(sample(),NaN)).toThrow();
});
