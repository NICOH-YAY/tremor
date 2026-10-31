# Scripted baseline survival follow-up — 2026-10-31 UTC

The requested credible-completion target is **not achieved**. The frozen scripted
run exits **4/20 episodes**: 14 deaths and two step limits. Careful exits **2/6
tuning episodes (33.3%)**, below the requested 4/6. Completion has not improved
from the previous 4/20 report. These controllers remain weak navigation/combat
baselines; the changes do not establish rubric 4b completion credibility.

The declared maps, seeds and skill are unchanged: tuning E1M1–E1M3, held-out
E1M4–E1M5, seeds 17/83, skill index 2. This session restores the user-requested
**600 action / 600 call** budget, superseding the earlier 1800-budget amendment.
Each action remains seven 35Hz tics; per-call timeout is 20 seconds and episode
wall time is five minutes. The runner imposes 600 before the unchanged engine's
1800-action ceiling. No C source changed and no headless rebuild was needed.
Comparisons with the previous 1800-action report do not isolate controller effects.

## Frozen results

Config `tremor-engine-v6-survival-route40-600-k8`, 2026-10-31 UTC. The
[JSON report](eval/results/2026-10-31-results.json) records source/artifact hashes,
exact per-episode metrics, revision, budgets and lossless trace paths. The
[per-seed table](eval/results/2026-10-31-table.md) labels tuning and held-out rows.
Counts below are exits / deaths / step limits, two starts per cell.

| Split | Level | Aggressive | Careful |
| --- | --- | --- | --- |
| Tuning | E1M1 | 2 / 0 / 0 | 2 / 0 / 0 |
| Tuning | E1M2 | 0 / 2 / 0 | 0 / 2 / 0 |
| Tuning | E1M3 | 0 / 1 / 1 | 0 / 1 / 1 |
| Held-out | E1M4 | 0 / 2 / 0 | 0 / 2 / 0 |
| Held-out | E1M5 | 0 / 2 / 0 | 0 / 2 / 0 |

| Player | Exits | Deaths | Limits | Crew killed / saved | Reads | Fired unread |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| Aggressive | 2 | 7 | 1 | 20 / 0 | 0 | 19 |
| Careful | 2 | 7 | 1 | 1 / 2 | 34 | 0 |

Zero illegal actions and controller errors were reported. There were no call
limits, timeouts or live model invocations. Both model conditions were explicitly
skipped by `npm run eval`; scripted model calls, tokens and API costs are zero.
Final terror stayed steady in all episodes. Trauma is separately recorded.
Careful's one crew death despite zero fired-unread shows that recognition does
not prevent every crew casualty (for example intervening figures can be hit).
The result alone does not establish the precise cause of that casualty.

## Tuning evidence and changes

Only E1M1–E1M3 informed policy selection. The requested E1M2/E1M3 diagnostics
used `scripts/trace-baseline.ts` at seeds 17/83. Original careful seed17 died
at 93 actions on E1M2 with 80 rounds, and at 112 on E1M3 with 74 rounds.
Public traces show stationary recognition, repeated tracking turns, health loss
without an in-view target, and close engagements while additional figures enter
the view. Ammunition exhaustion and a terror spiral do not explain those runs.

The careful policy now recognizes within 384 units, tracks with fine-turn READ
macros, aims before spending rounds, closes when rounds are scarce, and backs
away while firing at close range with a gun. Both policies retain bounded visible
health/armor/weapon detours and now consider visible ammunition when low, switch
to fists when empty, and ignore corpses. Safe-route memory uses only public map
arrow cells; a damaged, blocked player facing a crowd can turn back along that
trail. Recentering clears the trail. Retreat is bounded and aborts on blockage;
it attempts to break sight but does not guarantee cover. Repeated map-cell visits
trigger a bounded lateral recovery. Existing route guidance and door/switch USE
remain. No observation fields, hidden identities, map/seed dispatch, coordinates,
privileged setters, C code or assets were added.

Development compared broader combat, pistol use, sprinting, shorter recognition,
fine-turn recognition, moving READ, supply priority, close stun, retreat thresholds
and repeated-cell recovery. Several survival variants regressed E1M1. A trial
reached E1M2 seed17 action284 with five reads and one saved crew but still died;
another survived E1M2 seed83 to 600 without exiting. These are failed development
trials, not successes or additional independent evaluation samples. An initial
full rerun exposed aggressive's E1M1 regression; its original close-combat branch
was restored using those tuning rows and verified at 111/125 actions. A fresh
20-episode run produced the table above. Held-out results selected no changes.

E1M2 is still a combat failure: final careful dies at actions124/140 with rounds
remaining, despite four reads each. The bounded recognition/combat policy cannot
reliably identify and neutralize the encountered group before losing health.
E1M3 seed17 dies at115 after three reads and one successful purge. Seed83 instead
survives600, READs nine figures and repeatedly returns toward the same route-switch
objective. Lateral recovery does not complete that activation. The public cue and
local recovery do not provide a reliable activation traversal for this policy.
These observations **do not prove either map unwinnable by a heuristic**. They
identify failures of this implementation within the requested budget; a general
solution and the 4/6 target remain unfinished.

## Verification and reproduction

`npm test`: 126 passing. Production-module completion regression now covers both
E1M1 seeds17/83 within600 actions/calls from normal spawn, using the actual careful
controller. Additional checks cover retreat toward remembered safe cells and
scarce/empty-round behavior. Existing public-observation, opaque-state, identity
non-leakage, action-vocabulary and engine boundary tests remain green.

Typecheck and build pass; build retains the existing unresolved `./art/title.jpg`
warning. `npm run engine:test`: 470 checks, zero failures. The artifact manifest
was refreshed with `engine/build/artifacts.py` and every hash was verified against
shipped bytes, including LF-normalized text. No C changes, headless rebuild,
interactive human-play verification, commit or push is claimed.

```sh
npm run eval
TRACE_SEED=17 node --import ./scripts/typescript-loader.mjs scripts/trace-baseline.ts E1M2
```

On PowerShell use `$env:TRACE_SEED=17` before the trace command and `npm.cmd` if
execution policy blocks npm.ps1. Diagnostics are gitignored public JSONL and
map snapshots under `eval/diagnostics/`; final episode traces are lossless
JSONL.gz under `eval/traces/`, referenced by the report. The previous report is
retained as [pre-survival JSON](eval/results/2026-10-31-pre-survival-results.json)
and [table](eval/results/2026-10-31-pre-survival-table.md). Earlier prototype
successes remain superseded and are not production-engine completion evidence.
