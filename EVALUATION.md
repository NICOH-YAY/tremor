# Evaluation - 2026-10-31

Current engine, skill index 2, 40 constant seven-tic actions. Tuning E1M1-E1M3; seen E1M4/E1M5; fresh model held-out E1M6/E1M7 frozen 2026-10-31 before model trials. Two RNG starts 17/83 per map/player. Seeds change only the low-eight-bit RNG table start: modulo-256 equivalent seeds are identical, not different levels.

Report: [full JSON](eval/results/2026-10-31-2026-10-31T05-54-45-516Z-results.json). Run ID: `2026-10-31T05-54-45-516Z`. HEAD: `c6316ff03972c0a2aaf8ccdf44386357e660a674`. Working tree: **dirty**; this is not clean committed-tree evidence. Codex was forbidden to commit; Claude must commit then rerun the frozen command. Controller/artifact hashes and computed configuration ID are in the JSON.
Configuration: `c5337d427eec768ce4379a1e402abca5b9ca071df7e67cf70a9520bc11c0791a`. Limits: 600 actions, 600 calls, 20 seconds/call, five minutes/episode. Natural exit/death precedes later limits.

Command: `npm run eval -- --players baseline_aggressive,baseline_careful --cases all`. Default `npm run eval` also explicitly skips model players without --live. No live numbers fabricated.

| Player | Exits/trials | Deaths | Step/call limits | Timeouts | Illegal | Errors | Calls | Decision latency total ms | Tokens in/out | API cost USD (2026-10-31) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline_aggressive | 2/14 | 10 | 2/0 | 0 | 0 | 0 | 3037 | 239.8 | 0/0 | 0 (scripted, no API) |
| baseline_careful | 2/14 | 10 | 2/0 | 0 | 0 | 0 | 3427 | 255.8 | 0/0 | 0 (scripted, no API) |
| model-history | **pending live run** | pending | pending | pending | pending | pending | pending | pending | pending | pending; price unverified |
| model-obs-only | **pending live run** | pending | pending | pending | pending | pending | pending | pending | pending | pending; price unverified |

Latency above is controller decision time, not engine episode/frame cost. Model transport failures may have unknown billed usage. No live cost estimate or pricing assertion is made. No statistical claim from two fixed seeds. Both baselines use only public observations; careful may fire unread below 90 health. E1M1 success does not establish whole-suite competence.

| Player | Tuning exits | Seen exits | Held-out exits |
|---|---|---|---|
| baseline_aggressive | 2/6 | 0/4 | 0/4 |
| baseline_careful | 2/6 | 0/4 | 0/4 |

Secondary metrics are present for every trial. Route progress is an evaluator-only sector-hop distance-to-exit proxy (0-99, exit=100), ignoring locks/heights; objectives reached counts distinct key types collected plus completed exit; switch-only subtasks are not counted. These limitations prevent overstating navigation success.

| Player | Map/seed | Split | Outcome | Steps | Route % | Objectives | Health | Kills human/demon | Crew killed/saved | Reads | Fired unread | End terror |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline_aggressive | E1M1/17 | tuning | exit | 115 | 100 | 1 | 71 | 3/1 | 1/0 | 0 | 0 | steady |
| baseline_aggressive | E1M1/83 | tuning | exit | 114 | 100 | 1 | 69 | 3/0 | 2/0 | 0 | 0 | steady |
| baseline_aggressive | E1M2/17 | tuning | dead | 285 | 0 | 0 | 0 | 6/2 | 2/0 | 0 | 6 | steady |
| baseline_aggressive | E1M2/83 | tuning | step_limit | 600 | 0 | 0 | 100 | 5/2 | 3/0 | 0 | 4 | steady |
| baseline_aggressive | E1M3/17 | tuning | dead | 283 | 50 | 0 | 0 | 6/0 | 1/0 | 0 | 5 | steady |
| baseline_aggressive | E1M3/83 | tuning | step_limit | 600 | 29 | 0 | 85 | 6/0 | 3/0 | 0 | 4 | steady |
| baseline_aggressive | E1M4/17 | seen | dead | 289 | 0 | 0 | 0 | 1/3 | 1/0 | 0 | 0 | steady |
| baseline_aggressive | E1M4/83 | seen | dead | 177 | 0 | 0 | 0 | 0/2 | 0/0 | 0 | 0 | steady |
| baseline_aggressive | E1M5/17 | seen | dead | 68 | 33 | 0 | 0 | 3/0 | 2/0 | 0 | 0 | steady |
| baseline_aggressive | E1M5/83 | seen | dead | 111 | 26 | 0 | 0 | 4/0 | 1/0 | 0 | 0 | steady |
| baseline_aggressive | E1M6/17 | held-out | dead | 81 | 16 | 0 | 0 | 5/1 | 0/0 | 0 | 4 | steady |
| baseline_aggressive | E1M6/83 | held-out | dead | 86 | 16 | 0 | 0 | 2/2 | 1/0 | 0 | 2 | steady |
| baseline_aggressive | E1M7/17 | held-out | dead | 98 | 43 | 0 | 0 | 0/4 | 0/0 | 0 | 0 | steady |
| baseline_aggressive | E1M7/83 | held-out | dead | 130 | 37 | 0 | 0 | 0/3 | 0/0 | 0 | 0 | steady |
| baseline_careful | E1M1/17 | tuning | exit | 140 | 100 | 1 | 11 | 1/0 | 0/0 | 2 | 0 | steady |
| baseline_careful | E1M1/83 | tuning | exit | 108 | 100 | 1 | 78 | 1/1 | 0/0 | 1 | 0 | steady |
| baseline_careful | E1M2/17 | tuning | dead | 582 | 0 | 0 | 0 | 8/2 | 1/0 | 2 | 7 | steady |
| baseline_careful | E1M2/83 | tuning | dead | 361 | 0 | 0 | 0 | 4/2 | 1/0 | 3 | 1 | steady |
| baseline_careful | E1M3/17 | tuning | step_limit | 600 | 29 | 0 | 50 | 10/0 | 1/0 | 0 | 7 | steady |
| baseline_careful | E1M3/83 | tuning | step_limit | 600 | 29 | 0 | 94 | 5/0 | 1/0 | 3 | 3 | steady |
| baseline_careful | E1M4/17 | seen | dead | 62 | 17 | 0 | 0 | 0/0 | 0/0 | 1 | 0 | steady |
| baseline_careful | E1M4/83 | seen | dead | 177 | 0 | 0 | 0 | 0/2 | 0/0 | 0 | 0 | steady |
| baseline_careful | E1M5/17 | seen | dead | 46 | 33 | 0 | 0 | 1/0 | 0/0 | 0 | 0 | steady |
| baseline_careful | E1M5/83 | seen | dead | 143 | 26 | 0 | 0 | 4/4 | 0/0 | 1 | 0 | steady |
| baseline_careful | E1M6/17 | held-out | dead | 118 | 16 | 0 | 0 | 3/2 | 0/0 | 1 | 2 | steady |
| baseline_careful | E1M6/83 | held-out | dead | 262 | 50 | 0 | 0 | 6/3 | 1/0 | 4 | 2 | steady |
| baseline_careful | E1M7/17 | held-out | dead | 98 | 43 | 0 | 0 | 0/4 | 0/0 | 0 | 0 | steady |
| baseline_careful | E1M7/83 | held-out | dead | 130 | 37 | 0 | 0 | 0/3 | 0/0 | 0 | 0 | steady |

Representative complete public-observation/action traces (gzipped JSONL; raw traces remain gitignored). A model trace is pending a live trial:

- [exit: baseline_aggressive E1M1/17](eval/traces-sample/baseline-success.jsonl.gz), SHA-256 `8a9d7f6c9b53ca1bbe862e3d687499040285ce2960e6933577ced73407cf7274`.
- [dead: baseline_aggressive E1M2/17](eval/traces-sample/baseline-death.jsonl.gz), SHA-256 `fc252edc54cec804652e949343375aac2361b8e47d18c9c322223a28a220873f`.
- [step_limit: baseline_aggressive E1M2/83](eval/traces-sample/baseline-limit.jsonl.gz), SHA-256 `e51fe9992ded7752db00eb2274a1fdf58edecede23dc48e6aa867ddb23ca9251`.

| Date | Declaration/amendment | Prior results seen? |
|---|---|---|
| 2026-10-30 | Real-engine suite replaced TS cases | TS results superseded |
| 2026-10-30 | 600 raised to 1800 for navigation/channel allowance | Development diagnostics |
| 2026-10-31 | Survival follow-up restored 600; C reconciled to same ceiling | Baseline development/results |
| 2026-10-31 | E1M4/E1M5 marked seen; E1M6/E1M7 frozen before model trials | E1M4/E1M5 already inspected |

Full declaration history: [EVALUATION-PLAN](docs/EVALUATION-PLAN.md). No controller/prompt changes used E1M6/E1M7 outcomes. Review-driven engine corrections rerun all cases, not selected successful seeds.

Validation: 43 active Vitest tests / 9 files; 508 compiled C checks, no failures; typecheck/build/engine:test pass. [Five kinds](tests/README.md). [Every finding response](docs/reviews/review-response-2026-10-31.md). [Two skill invocations](docs/SKILL-INVOCATIONS.md).

Software-render mean 0.230 to 0.193 ms/frame; p95 0.338 to 0.275 ms. 200 headless wait+observe steps 1290 to 771 ms. Excludes Canvas/DOM/audio and is not a target-Brave measurement. No browser was exposed by UI tools. Visual/audible fixes and a full human episode still need playtesting. Live comparisons, clean committed rerun, personal agent-team account, peer notes and recording remain submission work.
