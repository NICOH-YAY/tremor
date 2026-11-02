import {test,expect} from 'vitest';
import {hintBounds} from '../public/hint-layout.js';
test('first-time hints fit above the status bar in the displayed view',()=>{
 for(const height of [200,400,720]){const r={left:50,top:40,width:height*4/3,height};const b=hintBounds(r);expect(b.top).toBeGreaterThanOrEqual(r.top);expect(b.bottom).toBeLessThan(r.top+height*168/200);expect(b.left).toBeGreaterThan(r.left);expect(b.width).toBeLessThan(r.width);}
});
