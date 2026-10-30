import { it, expect } from 'vitest';
import { reset } from '../src/player_interface';
import { tick, idleCmd } from '../src/sim/world';
import { renderToBuffer, makeFallbackTextures } from '../src/render/raycaster';
import { writeFileSync } from 'node:fs';
it('480x270 software frame including simulation stays below 6ms', () => {
    const tex = makeFallbackTextures(), pixels = new Uint32Array(480 * 270), view = { shake: 0, flash: 0, recoil: 0, weaponSway: 0, bob: 0 }, cmd = idleCmd(), results = [];
    for (const id of ['hangar', 'quarantine', 's1_corridor', 's2_collar', 's3_triage', 'h1_dark', 'h2_door']) {
        const w = reset(17, id), pose = { pos: w.player.pos, angle: 0 };
        for (let i = 0; i < 30; i++)
            renderToBuffer(pixels, 480, 270, w, pose, view, tex);
        const start = performance.now();
        for (let i = 0; i < 240; i++) {
            if ((i * 35) % 60 < 35)
                tick(w, cmd);
            pose.angle = i * .04;
            renderToBuffer(pixels, 480, 270, w, pose, view, tex);
        }
        const ms = (performance.now() - start) / 240;
        results.push({ level: id, ms });
        expect(ms).toBeLessThan(6);
    }
    if (process.env.INTEGRATION_REPORT === '1')
        writeFileSync('eval/integration-performance.json', JSON.stringify({ size: '480x270', framesPerLevel: 240, scope: 'Node software raster + 35Hz tick at 60fps; excludes browser canvas upload, DOM and audio; fallback textures', results }, null, 2));
});
