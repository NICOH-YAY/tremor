// @vitest-environment happy-dom
import {it,expect,vi} from 'vitest';
it('boots and displays the title',async()=>{vi.stubGlobal('requestAnimationFrame',vi.fn());await import('../src/main');expect(document.body.textContent).toContain('TREMOR');expect(document.querySelectorAll('canvas')).toHaveLength(2);vi.unstubAllGlobals();});
