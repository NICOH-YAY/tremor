// @vitest-environment happy-dom
import {test,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {validateIWAD} from '../public/startup.js';
import {spawnSync} from 'node:child_process';
test('public JS parses (Vite copies these assets without parsing)',()=>{for(const name of ['engine-page','horror','settings-ui','settings-store','startup']){const r=spawnSync(process.execPath,['--check',`public/${name}.js`],{encoding:'utf8'});expect(r.status,r.stderr).toBe(0);}});
test('title/help initialize and repeated invalid WAD loads allocate no audio context',async()=>{
 document.body.innerHTML=readFileSync('index.html','utf8').split('<body>')[1].split('</body>')[0].replace(/<script[\s\S]*?<\/script>/g,'');
 vi.stubGlobal('requestAnimationFrame',vi.fn());vi.stubGlobal('ResizeObserver',class{observe(){}});
 const context=vi.fn();vi.stubGlobal('AudioContext',context);
 vi.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue({createImageData:()=>({data:new Uint8ClampedArray(320*200*4)})});
 await import('../public/engine-page.js');
 expect(document.querySelector('#how-to-play')?.textContent).toContain('35 tics');
 const input=document.querySelector('#wad');
 Object.defineProperty(input,'files',{value:[{arrayBuffer:async()=>new Uint8Array(4).buffer}]});
 for(let i=0;i<2;i++){input.dispatchEvent(new Event('change'));await vi.waitFor(()=>expect(document.querySelector('#error')?.textContent).toContain('supported Doom IWAD'));}
 expect(context).not.toHaveBeenCalled();expect(document.querySelectorAll('button').length).toBeGreaterThan(3);
 vi.unstubAllGlobals();vi.restoreAllMocks();
});

test('WAD structural validation rejects empty directories and out-of-bounds lumps before audio',()=>{const bytes=readFileSync('public/wad/freedoom1.wad');expect(()=>validateIWAD(bytes)).not.toThrow();const broken=Buffer.from(bytes);broken.writeInt32LE(0,4);expect(()=>validateIWAD(broken)).toThrow('directory');broken.writeInt32LE(bytes.readInt32LE(4),4);broken.writeInt32LE(bytes.length,bytes.readInt32LE(8));broken.writeInt32LE(1,bytes.readInt32LE(8)+4);expect(()=>validateIWAD(broken)).toThrow('lump');});
