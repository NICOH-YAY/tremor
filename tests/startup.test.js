// @vitest-environment happy-dom
import {test,expect} from 'vitest';
import {createIntroGate,requestCanvasLock} from '../public/startup.js';
import {readFileSync} from 'node:fs';
test('observed double intro resolves both pending calls and later calls',async()=>{const card=document.createElement('section'),button=document.createElement('button');const gate=createIntroGate(card,button);const a=gate.wait(),b=gate.wait();button.click();await Promise.all([a,b,gate.wait()]);expect(card.hidden).toBe(true);});
test('pointer lock rejection is consumed',async()=>{await expect(requestCanvasLock({requestPointerLock(){return Promise.reject(new DOMException('invalid document','WrongDocumentError'));}})).resolves.toBeUndefined();});
test('manual engine entry disables Emscripten automatic main and guards repeat clicks',()=>{const source=readFileSync('public/engine-page.js','utf8');expect(source).toContain('noInitialRun:true');expect(source).toContain('enginePromise??=createDoom');expect(source).toContain('if(starting)return;starting=true');expect(source.match(/createDoom\(/g)).toHaveLength(1);});
