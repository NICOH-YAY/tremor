# Baseline diagnosis - 2026-10-31 UTC

The initial diagnostic ran the unmodified careful controller on E1M1 seed 1.
It died after 383 actions, with 26 rounds remaining, two demon kills and one
crew saved. At steps 380-382 it had 19 health, still reported the objective as
far, and alternated slow movement with turns. The first actions inferred a
northward exit from the straight-line bearing, then steered using optimistic
map paths and accumulated bearing rays. Combat and remembered supply detours
could take priority for many seconds. No terror spiral was observed: terror
remained steady. The suggested 30% hit-rate explanation was not established by
this trace and is not asserted as a finding.

A route-first experiment exposed two concrete navigation regressions. Holding
a waypoint for 35 tics caused reversals after overshooting short corners.
Marking a legally occupied cell near a wall as blocked produced waypoints a
few units behind the player. Repeated USE also delayed passage under attack.
The final cue refreshes every seven tics, respects player clearance, samples
intermediate path cells and uses a bounded door cooldown/recovery policy.
Medium turns and moving turns reduce the time spent stationary while steering.

E1M2 diagnostics reached a blue door while the old sector quest planner claimed
that the next objective was the red card. A sector-only graph can cross tall
ledges and miss a required activation. The new planner considers floor heights,
headroom, key locks and tagged activations, then supplies the resulting public
cue through both TAB and Observation. It still does not solve every lift or
teleporter arrangement. The route does not supply hidden enemy/crew identities.

Final controllers use only Observation and the constant legal IDs. They ignore
distant combat, bound close engagements and recognition attempts, collect
nearby visible supplies, probe doors, and resume route following. Careful READs
unread figures before attacking; aggressive attacks unread figures. Corpses
are not targets. There is no map-name, seed or hidden-coordinate dispatch.

Development trials on E1M1-E1M3 compared read distance, stationary versus moving
READ, movement speed, engagement distance, crowded-combat avoidance and visible
supply detours. E1M4/E1M5 did not inform tuning. Faster movement and suppressing
all recognition were not reliable improvements. None of these repeated fixed
seeds is an additional independent evaluation trial.

Both declared E1M1 seeds now complete under both policies. E1M2/E1M3 remain
failures: periods of stationary recognition/combat in groups still consume
health, and activation/platform navigation remains limited. The requested 50%
tuning completion target has not been reached. The final extra seed 1 diagnostic
also dies; declared-seed success is not evidence of general E1M1 reliability.
The genuine production-engine completion regression is E1M1 seed 17, not an exit
fixture or synthetic replay.

Reproduce the per-step public trace and automap SVG/text snapshots:

```sh
node --import ./scripts/typescript-loader.mjs scripts/trace-baseline.ts
# Optional: --aggressive or E1M2; TRACE_SEED defaults to 1.
```

Outputs go to gitignored `eval/diagnostics/`. Every line records action, health,
rounds, objective bearing/distance, heading, motion, terror and visible entities;
the final line records the terminal reason/outcome. Snapshots cover reset,
periodic progress, health loss, blocked motion, objective changes and termination.
The SVGs are drawn solely from public map pixels. A step 50 PNG was also visually
inspected during development; no new interactive browser-play claim is made.

## 2026-10-31 controller survival follow-up

Only E1M2/E1M3 trace diagnostics and tuning-map trials informed the survival
changes; held-out E1M4/E1M5 informed no change. See EVALUATION.md for the final
600-action results and failed development variants. Final careful seed 17 dies
at 124 on E1M2 with 77 rounds and at 115 on E1M3 with 79 rounds; terror stays steady.
Fine-turn READ improves tracking but still costs stationary time under fire.
Final E1M3 seed 83 survives 600 with nine reads but loops toward the route-switch
objective. Repeated-cell lateral recovery does not solve that activation.

Controllers now include bounded safe-cell retreat when damaged and blocked in a
crowd, map-recenter invalidation, low-ammo visible supply selection, empty-gun
fists, careful close back-fire and scarcity-based closing. These are attempted
survival improvements, not evidence that cover or activation traversal is solved.
Aggressive retains its original close-combat branch after broader combat regressed
E1M1 tuning completion. Completion remains 4/20 overall and 2/6 for careful tuning;
the requested 4/6 target is not met. Neither map has been proved unwinnable by a
heuristic. Production completion tests cover both E1M1 seeds under 600 actions.
