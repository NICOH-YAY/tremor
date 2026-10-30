# Evaluation status

2026-10-30: No live model trials have been run. The declared suite and hypotheses
remain in docs/EVALUATION-PLAN.md. Baseline evidence is recorded in
eval/integration-baselines.json; CI asserts both baselines reach the exit across
seven levels at seeds 17 and 83 (28 runs).

Seed diversity is limited: many baseline outcomes are identical across seeds
(e.g. s1 68/68 steps, h1 74/74, h2 44/44 in the recorded evidence). Two seeds
should not be interpreted as independent behavioral evidence or statistical
confidence. Live model results, dated prices and browser verification remain
unavailable. Known token totals exclude usage unavailable after transport errors
or timeouts; unknownUsageCalls exposes those calls, and cost remains null.
