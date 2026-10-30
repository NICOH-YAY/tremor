import {test,expect} from 'vitest';
import createDoom from '../public/engine/doom.js';
test('production module exposes callable music and input ABI',async()=>{
 const m=await createDoom({print(){},printErr(){}});
 for(const name of ['tremor_music_render','tremor_music_rate','tremor_music_active','tremor_translate_key','tremor_input','tremor_set_screen_shake','tremor_menu_active'])expect(typeof m['_'+name]).toBe('function');
 m._tremor_music_rate(48000);expect(m._tremor_music_active()).toBe(0);
 const ptr=m._tremor_music_render(128);expect(ptr).toBeGreaterThan(0);expect(m.HEAP16.subarray(ptr>>1,(ptr>>1)+256).every(v=>v===0)).toBe(true);expect(m.IDBFS).toBeTruthy();
});
