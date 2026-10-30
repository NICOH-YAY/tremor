// @vitest-environment happy-dom
import { it, expect, vi } from 'vitest';
import type { World } from '../src/sim/types';
const capture = vi.hoisted(() => ({ world: undefined as World | undefined }));
vi.mock('../src/player_interface', async (original) => { const m = await original<typeof import('../src/player_interface')>(); return { ...m, reset: (seed: number, id?: string) => capture.world = m.reset(seed, id) }; });
vi.mock('../src/render/raycaster', () => ({ Raycaster: class {
        resize() { }
        render() { }
    } }));
vi.mock('../src/audio', () => ({ audio: { play: vi.fn() } }));
it('plays title, pause, restart, story intermission, death retry, ending and title flow', async () => {
    let frame: FrameRequestCallback = () => { };
    vi.stubGlobal('requestAnimationFrame', vi.fn(cb => { frame = cb; return 1; }));
    await import('../src/main');
    const click = (text: string) => { const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent === text); expect(b).toBeDefined(); b!.click(); };
    expect(document.body.textContent).toContain('The gun works perfectly.');
    expect(document.querySelectorAll('canvas')).toHaveLength(2);
    click('Click to begin');
    expect(capture.world?.levelId).toBe('hangar');
    expect(window.__tremor?.world).toBe(capture.world);
    window.__tremor!.teleport(3.5, 4.5, .7);
    expect(capture.world!.player.pos).toEqual({ x: 3.5, y: 4.5 });
    expect(capture.world!.player.angle).toBe(.7);
    expect(capture.world!.player.vel).toEqual({ x: 0, y: 0 });
    expect(() => window.__tremor!.teleport(NaN, 0, 0)).toThrow();
    document.dispatchEvent(new Event('pointerlockchange'));
    click('Restart level');
    expect(capture.world?.tic).toBe(0);
    expect(window.__tremor?.world).toBe(capture.world);
    let time = 100;
    frame(time);
    const finish = (reason: 'exit' | 'dead') => { capture.world!.done = true; capture.world!.outcome = reason; time += 40; frame(time); };
    capture.world!.player.tremor = 2;
    finish('exit');
    expect(document.body.textContent).toContain('still alive');
    click('Continue');
    expect(capture.world?.levelId).toBe('quarantine');
    expect(capture.world?.player.tremor).toBe(2);
    finish('dead');
    click('Try again');
    expect(capture.world?.levelId).toBe('quarantine');
    expect(capture.world?.player.tremor).toBe(2);
    expect(capture.world?.player.health).toBe(100);
    finish('exit');
    expect(document.body.textContent).toContain('B-2');
    click('Continue');
    expect(document.body.textContent).toContain('Click to begin');
    vi.unstubAllGlobals();
});
