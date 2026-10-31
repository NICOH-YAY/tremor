# Real-engine evaluation follow-up: completion target NOT met

The latest frozen scripted pass completed **0/20 levels**: **16 deaths and 4 step limits**. The target of substantial completion (aiming for 50% on E1M1-E1M3) was not achieved: tuning-map completion is 0/12. These bots are still not a credible successful-navigation benchmark. The required normal-spawn completion regression remains an explicit TODO; the exit-switch fixture is not substituted for it.

The [declared-before-tuning plan](docs/EVALUATION-PLAN.md) remains intact: tuning E1M1/E1M2/E1M3, held-out E1M4/E1M5, seeds 17/83, Hurt Me Plenty. No cases or seeds were moved. Dated amendments record changes in public observations, controls, objective rules, horror presentation and limits. Only tuning-map traces informed controller changes; held-out results were reported without tuning against them.

## Latest results

Run date 2026-10-31 UTC (October 30 local), config `tremor-engine-v4-public-map36-7tic-k8`, HEAD `27f662b`, uncommitted working tree. The [full per-seed table](eval/results/2026-10-31-table.md) and [JSON report](eval/results/2026-10-31-results.json) identify exact engine/WAD and controller/interface source hashes.

Counts below are **exits / deaths / step limits**, with two seeds per player and level.

| Level | Aggressive | Careful |
| --- | --- | --- |
| E1M1 | 0 / 2 / 0 | 0 / 2 / 0 |
| E1M2 | 0 / 1 / 1 | 0 / 2 / 0 |
| E1M3 | 0 / 2 / 0 | 0 / 2 / 0 |
| E1M4 | 0 / 0 / 2 | 0 / 1 / 1 |
| E1M5 | 0 / 2 / 0 | 0 / 2 / 0 |

| Player | Exits | Deaths | Limits | Illegal / errors | Crew killed / saved | Reads | Fired unread | Mean decision latency |
| --- | ---: | ---: | ---: | --- | --- | ---: | ---: | ---: |
| baseline_aggressive | 0 | 7 | 3 | 0 / 0 | 26 / 0 | 0 | 124 | 4.036ms |
| baseline_careful | 0 | 9 | 1 | 0 / 0 | 3 / 3 | 33 | 0 | 3.741ms |

All 20 final terror buckets were **steady**, so this run does not distinguish the players on final terror. Numeric `finalTremor` in legacy output means trauma, not terror; the table now labels trauma and terror separately. Moral metrics distinguish the policies, but careful still killed 3 crew. Do not describe it as harmless or claim a causal/statistical result from two RNG starts.

There were no illegal actions, controller errors, API failures, call limits or timeouts. Scripted players made no model calls, used no model tokens and incurred no model API cost. Mean decision latency includes public-observation cloning/decision work, not simulation/render time. No live Vertex trials were run; the human owns those runs. Planned model/pricing metadata in the report is not evidence of a live invocation.

## What changed and what still fails

The public interface adds a useful-scale mapped grid with inferred visible floor, heading, closed/open door and switch/crossing glyphs, key colours, visible props/barrels/elevation, weapon inventory, motion feedback and an episode radio transcript. Humans receive matching map glyphs, zoom controls and Radio log. The shared objective planner prefers normal exits and avoids making optional locks mandatory solely because of linedef order. Its sector graph is topological and does not prove physical lift/height reachability.

Controllers use only Observation and the constant legal-action list. Their bounded map search, waypoint-bearing inference, frontier fallback, collision recovery, connected-door retry bound and 64-unit USE probe contain no world coordinates, hidden map IDs or crew identity. Open doors are traversed without being closed again. Aggressive fires at hostile figures, switches to fists when necessary, and strafes/retreats. Careful READs unknown humans, attempts STUN/PURGE while charges remain and prefers fists. Simultaneous movement/turning with fire or READ models controls available to a human.

These implementation changes did **not** solve sustained combat or general traversal. More episodes die than in the prior frozen engine report (6 deaths/14 limits); completion remains0. Correcting door handling exposes additional combat failure rather than providing successful paths. No success on an unplayed map, synthetic route, hidden-coordinate controller or privileged fixture is counted.

The cap is1800 actions/calls, seven35Hz tics each: **six simulated minutes**, compared with the earlier600-action/120-second cap. This budgets separate aiming, movement, door waits and 35-tic recognition/purge channels; it is an engineering allowance, not a measured human completion time. It was not enlarged further after failures. The20-second call and five-minute wall-clock limits remain. The JSON config records the change, so comparisons with the older600-step run are not controlled comparisons.

## Evidence and checks

The original [2026-10-30 engine report](eval/results/2026-10-30-results.json) is retained. Earlier follow-up [first-pass](eval/results/2026-10-31-first-followup-results.json) and [compatibility-pass](eval/results/2026-10-31-compatibility-pass-results.json) records also show0/20. Repeated fixed-seed runs are not independent additional trials. Old TypeScript28/28 authored-map results remain [superseded](eval/SUPERSEDED.md), and imply no Freedoom completion.

Full final traces are local gitignored JSONL.gz files referenced by each result. Compression is lossless and retains every public observation/action. The latest report captures controller/interface source hashes before the run; packaged artifacts are checked against the regenerated manifest. Rerun scripted only:

```sh
npm run eval -- --players baseline_aggressive,baseline_careful
```

Local checks: npm test120 passing plus one completion TODO; typecheck/build pass; engine:test470 checks,0 failures. Regressions cover public-field whitelisting, unread identity equivalence, absence of browser debug setters from both agent targets,64-unit closed-door use/open-passage preservation, episode history/save/playback behavior and mouse prediction. The genuine normal-spawn completion regression is **not implemented as a passing test** because no such baseline completion was achieved.

Node horror rendering measurements and inspected PNGs are in [HORROR-STATUS](docs/HORROR-STATUS.md). Native 640x400 failed inherited status-bar assumptions before a valid CPU sample. Browser inventory was empty, so no fresh interactive Chrome paint/audio/pointer-lock/save-reload verification is claimed. Remote CI and live models were not run. No commits were created.
