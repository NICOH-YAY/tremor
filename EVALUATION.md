# Scripted baselines now exit E1M1; broader completion target NOT met

The final scripted run completes **4/20 episodes**, with **15 deaths and one
step limit**. Both baselines finish E1M1 at both declared seeds. Careful completes
**2/6 tuning episodes (33.3%)**, below the requested 50% target on E1M1-E1M3.
Neither baseline completes E1M2-E1M5. This is a real completion improvement over
0/20, but not a successful general-navigation benchmark or a completed50% target.

The [declared plan](docs/EVALUATION-PLAN.md) is unchanged: tuning E1M1/E1M2/E1M3,
held-out E1M4/E1M5, seeds 17/83, Hurt Me Plenty. No cases, seeds or budgets moved.
Only tuning-map diagnostics informed changes. Repeated development runs of fixed
seeds are not independent trials. Held-out outcomes were not used for tuning.

## Final results

Run date 2026-10-31 UTC (October30 local), config
`tremor-engine-v5-public-route40-7tic-k8`, HEAD `d608349`, uncommitted working tree.
The [full per-seed table](eval/results/2026-10-31-table.md) and
[JSON report](eval/results/2026-10-31-results.json) record exact artifact hashes,
controller/interface source hashes, config, costs and trace paths.

Counts below are **exits / deaths / step limits**, two seeds per player/level.

| Level | Aggressive | Careful |
| --- | --- | --- |
| E1M1 | 2 / 0 / 0 | 2 / 0 / 0 |
| E1M2 | 0 / 2 / 0 | 0 / 2 / 0 |
| E1M3 | 0 / 1 / 1 | 0 / 2 / 0 |
| E1M4 | 0 / 2 / 0 | 0 / 2 / 0 |
| E1M5 | 0 / 2 / 0 | 0 / 2 / 0 |

| Player | Exits | Deaths | Limits | Crew killed / saved | Reads | Fired unread | Mean decision latency |
| --- | ---: | ---: | ---: | --- | ---: | ---: | ---: |
| baseline_aggressive | 2 | 7 | 1 | 20 / 0 | 0 | 18 | 0.110ms |
| baseline_careful | 2 | 8 | 0 | 0 / 2 | 24 | 0 | 0.101ms |

There were zero illegal actions, controller errors, API failures, call limits or
timeouts. All final terror buckets were steady, so final terror does not
distinguish the policies. Trauma and terror are separately labelled in the
per-seed table. Moral metrics distinguish the policies: careful killed no crew
in the declared suite, saved two and READ 24 times; aggressive killed 20 crew,
saved none and READ zero times. This is descriptive evidence on two starts,
not a statistical or causal result. The additional seed1 diagnostic includes
a careful crew death, so the policy is not guaranteed harmless.

No model trials were run. Plain `npm run eval` explicitly skipped both model
players without `--live`; no mock or scripted substitute was counted as a model.
Scripted players used zero model calls/tokens and incurred zero model API cost.
Planned Vertex metadata and unverified model pricing in JSON are not evidence of
an invocation. Decision latency includes public-observation cloning and policy
work, and excludes engine simulation/rendering and route-cue construction.

## Diagnosis and rule changes

The initial E1M1 seed1 diagnostic with the old controller died after 383 actions,
with ammunition still available, after long combat/supply/navigation detours.
Terror remained steady; a 30% hit-rate or corpse-driven terror spiral was not
established. Subsequent traces exposed stale-waypoint reversals, overly
conservative wall-cell clearance, repeated USE under attack, missing lock
ordering, and stationary recognition/combat in groups. Details and the trace
command are in [BASELINE-DIAGNOSIS](docs/BASELINE-DIAGNOSIS.md).

On 2026-10-31 UTC, the public objective rule changed from a straight-line arrow
to a geometry-derived route waypoint. Humans get the same bearing on TAB as
agents receive in Observation. The planner uses level geometry, height/headroom,
manual doors, keys and tagged activations; it avoids damaging floor and large
drops where alternatives exist. It does not inspect hidden combat identities or
route around moving enemies. Four constant macros add medium turns and moving
small turns, bringing the public vocabulary to 40. Rule sources and alternatives
are recorded in [rule-source-map](docs/rule-source-map.md) and
[DECISIONS](docs/DECISIONS.md). These public rule/control changes mean the v4/v5
comparison does not isolate the effect of controller changes.

Controllers use only public Observation and legal IDs. They no longer infer a
hidden exit coordinate from intersecting bearing rays. They follow the shared
cue, bound recognition/engagement attempts, choose visible supplies, probe doors
and recover from blocked movement. Careful READs unknown figures and attempts
aligned stun/purge; aggressive attacks unread figures. Corpses are not targets.
No map IDs, seed dispatch, world coordinates, state handles or outcome metrics
are controller inputs.

The change does not solve dense combat or all activation/platform arrangements.
Stationary channels and close fights still cost too much health on E1M2/E1M3.
An unreachable target now retains a reachable frontier cue rather than reverting
to a bearing through a wall. The extra final E1M1 seed1 trace still dies; both
declared seeds succeeding is not evidence of general E1M1 reliability.

Limits remain 1800 actions/calls, seven 35Hz tics each (six simulated minutes),
20 seconds per call and five minutes wall time. There was no new budget increase.
The previous full0/20 report is retained as
[pre-route results](eval/results/2026-10-31-pre-route-results.json) and
[pre-route table](eval/results/2026-10-31-pre-route-table.md). Earlier engine reports
remain available; prototype TypeScript successes remain
[superseded](eval/SUPERSEDED.md) and are not Freedoom evidence.

## Verification and reproduction

`npm test`: 122 passing, no completion TODO. The real production-engine regression
runs careful from the normal E1M1 seed17 spawn to exit within 1800 steps, using the
actual controller. It does not use an exit fixture, replay or privileged setter.
A separate regression checks that the initial route cue follows the corridor.
Existing public-field whitelist, unread-identity equivalence, constant-action,
invalid-action, opaque-state, extra-observe/RNG and debug-export tests pass.

Typecheck/build pass. Browser, production headless and test headless artifacts
were rebuilt. `npm run engine:test`: 470 checks, zero failures. The artifact hash
manifest was regenerated and verified against all listed files. Browser code was
built; no new interactive pointer-lock/audio/play verification or remote CI is
claimed. No commits were created; the branch remains main at d608349.

```sh
npm run eval
node --import ./scripts/typescript-loader.mjs scripts/trace-baseline.ts
```

Full final evaluation traces are lossless gitignored JSONL.gz files referenced
by each result. The small diagnostic script logs every public decision and
renders public automap SVG/text snapshots at reset, progress, health loss,
blocked movement, objective changes and termination in `eval/diagnostics/`.
