import { it, expect } from 'vitest';
import { baseline } from '../src/agent/baselines';
import { runEpisode } from '../src/eval/runner';
import { writeFileSync, mkdirSync } from 'node:fs';
it('baselines traverse authored levels', async () => {
    const report = process.env.INTEGRATION_REPORT === '1';
    if (report)
        mkdirSync('eval', { recursive: true });
    const rows = [];
    for (const careful of [true, false])
        for (const id of ['hangar', 'quarantine', 's1_corridor', 's2_collar', 's3_triage', 'h1_dark', 'h2_door'])
            for (const seed of [17, 83]) {
                const { trace, ...r } = await runEpisode(baseline(careful), { seed, levelId: id, tracePath: false });
                if (report && !r.reachedExit)
                    writeFileSync(`eval/debug-${r.player}-${id}-${seed}.json`, JSON.stringify(trace.slice(-12), null, 2));
                rows.push(r);
                console.log(r.player, id, seed, r.reason, r.steps);
            }
    if (report)
        writeFileSync('eval/integration-baselines.json', JSON.stringify(rows, null, 2));
    expect(rows.filter(r => r.player === 'baseline_careful').every(r => r.reachedExit)).toBe(true);
}, 60000);
