import { readFileSync } from 'node:fs';

// Offline evidence aggregation only: never invokes controllers or model APIs.
const path = process.argv.slice(2).find(arg => arg !== '--json') ?? 'eval/results/2026-10-31-2026-10-31T06-19-01-385Z-results.json';
const report = JSON.parse(readFileSync(path, 'utf8'));
const players = ['baseline_aggressive', 'baseline_careful', 'model-history', 'model-obs-only'];
function summarize(rows: any[]) {
  const sum = (key: string) => rows.reduce((n, row) => n + row[key], 0);
  const count = (reason: string) => rows.filter(row => row.reason === reason).length;
  const calls = sum('controllerCalls');
  return {
    episodes: rows.length, exits: count('exit'), deaths: count('dead'),
    stepLimits: count('step_limit'), callLimits: count('call_limit'),
    callTimeouts: sum('callTimeouts'), episodeTimeouts: sum('episodeTimeouts'),
    illegal: sum('illegalActions'), errors: sum('errors'), fallbacks: sum('fallbacks'),
    modelCalls: sum('modelCalls'), controllerCalls: calls,
    meanLatencyMs: sum('latencyMs') / calls,
    tokensIn: sum('tokensIn'), tokensOut: sum('tokensOut'),
    estimatedCost: (sum('tokensIn') * report.pricing.inputPerMillion + sum('tokensOut') * report.pricing.outputPerMillion) / 1e6,
    unknownUsageCalls: sum('unknownUsageCalls'),
    crewKilled: sum('crewKilled'), crewSaved: sum('crewSaved'), reads: sum('reads'),
    firedUnread: sum('firedUnread'), objectives: sum('objectivesReached'),
    steps: sum('steps'), meanRoutePercent: rows.reduce((n, row) => n + row.metrics.route_progress_pct, 0) / rows.length,
    terror: Object.fromEntries([...new Set(rows.map(row => row.finalTerrorBucket))].sort().map(bucket => [bucket, rows.filter(row => row.finalTerrorBucket === bucket).length])),
  };
}
const summary = players.map(player => ({ player, ...summarize(report.results.filter((row: any) => row.player === player)) }));
const splits = players.flatMap(player => ['tuning', 'seen', 'held-out'].map(split => ({ player, split, ...summarize(report.results.filter((row: any) => row.player === player && row.split === split)) })));
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ summary, splits }, null, 2));
} else {
  console.log('| Player | Episodes | Exits | Deaths | Step limits | Call limits | Call timeouts | Episode timeouts | Illegal | Errors | Fallbacks | Model calls | Mean latency ms | Tokens in/out | Est. USD | Crew killed/saved | Reads | Fired unread | Objectives | Final terror |');
  console.log('|' + Array(20).fill('---').join('|') + '|');
  for (const s of summary) console.log(`| ${s.player} | ${s.episodes} | ${s.exits} | ${s.deaths} | ${s.stepLimits} | ${s.callLimits} | ${s.callTimeouts} | ${s.episodeTimeouts} | ${s.illegal} | ${s.errors} | ${s.fallbacks} | ${s.modelCalls} | ${s.meanLatencyMs.toFixed(2)} | ${s.tokensIn}/${s.tokensOut} | ${s.estimatedCost.toFixed(6)} | ${s.crewKilled}/${s.crewSaved} | ${s.reads} | ${s.firedUnread} | ${s.objectives} | ${Object.entries(s.terror).map(([k,v]) => `${k}: ${v}`).join(', ')} |`);
  console.log('\n| Player | Split | Episodes | Exits | Deaths | Step limits | Episode timeouts | Steps | Mean route % | Objectives | Crew killed/saved | Reads | Fired unread |');
  console.log('|' + Array(13).fill('---').join('|') + '|');
  for (const s of splits) console.log(`| ${s.player} | ${s.split} | ${s.episodes} | ${s.exits} | ${s.deaths} | ${s.stepLimits} | ${s.episodeTimeouts} | ${s.steps} | ${s.meanRoutePercent.toFixed(2)} | ${s.objectives} | ${s.crewKilled}/${s.crewSaved} | ${s.reads} | ${s.firedUnread} |`);
}
