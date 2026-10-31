# Evaluation - 2026-10-31

Current engine, skill index 2, 40 constant seven-tic actions. Tuning E1M1-E1M3; seen E1M4/E1M5; fresh model held-out E1M6/E1M7 frozen 2026-10-31 before model trials. Two RNG starts 17/83 per map/player. Seeds change only the low-eight-bit RNG table start: modulo-256 equivalent seeds are identical, not different levels.

Report: [full JSON](eval/results/2026-10-31-2026-10-31T06-16-26-402Z-results.json). Run ID: `2026-10-31T06-16-26-402Z`. HEAD: `203810dcda4d7197d05309cb4437a1db25f37f31`. Working tree: **dirty**; this is not clean committed-tree evidence. Codex was forbidden to commit; Claude must commit then rerun the frozen command. Controller/artifact hashes and computed configuration ID are in the JSON.
Configuration: `faebcbfb97da87f4e3953745bc163d276f15e2e22c506ee9a343582eb8d6a363`. Limits: 600 actions, 600 calls, 20 seconds/call, five minutes/episode. Natural exit/death precedes later limits.

Command: `npm run eval -- --players baseline_aggressive,baseline_careful --cases all`. Default `npm run eval` also explicitly skips model players without --live. No live numbers fabricated.

| Player | Exits/trials | Deaths | Step/call limits | Timeouts | Illegal | Errors | Calls | Decision latency total ms | Tokens in/out | Unknown usage calls | API cost USD (2026-10-31) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline_aggressive | 2/14 | 10 | 2/0 | 0 | 0 | 0 | 3037 | 239.5 | 0/0 | 0 | 0 (scripted, no API) |
| baseline_careful | 2/14 | 10 | 2/0 | 0 | 0 | 0 | 3427 | 258.1 | 0/0 | 0 | 0 (scripted, no API) |
| model-history | **pending live run** | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |
| model-obs-only | **pending live run** | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |

Pricing verified 2026-10-31: gemini-3.5-flash-lite, global, standard, USD $0.3/1M input, $2.5/1M output, $0.03/1M cached (unused). [Vertex pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing). Temperature 0.2; location global.

| Player | Call timeouts | Episode timeouts |
|---|---|---|
| baseline_aggressive | 0 | 0 |
| baseline_careful | 0 | 0 |
| model-history | pending | pending |
| model-obs-only | pending | pending |

A 20 s call timeout ends the episode with reason timeout; the 300 s episode cap also ends it. Counters distinguish which deadline fired.

Latency above is controller decision time, not engine episode/frame cost. Model transport failures may have unknown billed usage. Estimated costs use reported input plus output/reasoning tokens; unknown-usage transport failures make totals lower bounds. No statistical claim from two fixed seeds. Both baselines use only public observations; careful may fire unread below 90 health. E1M1 success does not establish whole-suite competence. Seen/held-out baseline comparisons concern route progress and survival, with no demonstrated completion. Public route/objective guidance reveals unseen geometry and key dependencies; this is easier than vision-only navigation.

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

- [exit: baseline_aggressive E1M1/17](eval/traces-sample/baseline-success.jsonl.gz), SHA-256 `83f25608218121c312d89858bec362ab8782652231078d4317301ce01d08cd17`.
- [dead: baseline_aggressive E1M2/17](eval/traces-sample/baseline-death.jsonl.gz), SHA-256 `b6011f85561ff97a1aaa09de46e58169f97aebe7a7eff0fc0d41fa63706036ae`.
- [step_limit: baseline_aggressive E1M2/83](eval/traces-sample/baseline-limit.jsonl.gz), SHA-256 `36c00f4169b5d991cede5ce8be63887bbae19e39ff3607bce32df52ef9342cff`.

| Date | Declaration/amendment | Prior results seen? |
|---|---|---|
| 2026-10-30 | Real-engine suite replaced TS cases | TS results superseded |
| 2026-10-30 | 600 raised to 1800 for navigation/channel allowance | Development diagnostics |
| 2026-10-31 | Survival follow-up restored 600; C reconciled to same ceiling | Baseline development/results |
| 2026-10-31 | E1M4/E1M5 marked seen; E1M6/E1M7 frozen before model trials | E1M4/E1M5 already inspected |

Full declaration history: [EVALUATION-PLAN](docs/EVALUATION-PLAN.md). No controller/prompt changes used E1M6/E1M7 outcomes. Review-driven engine corrections rerun all cases, not selected successful seeds.

Validation: see docs/SKILL-INVOCATIONS.md for current commands; 508 compiled C checks, no failures; typecheck/build/engine:test pass. [Five kinds](tests/README.md). [Every finding response](docs/reviews/review-response.md). [Two skill invocations](docs/SKILL-INVOCATIONS.md).

Software-render mean 0.230 to 0.193 ms/frame; p95 0.338 to 0.275 ms. 200 headless wait+observe steps 1290 to 771 ms. Excludes Canvas/DOM/audio and is not a target-Brave measurement. No browser was exposed by UI tools. Visual/audible fixes and a full human episode still need playtesting. Live comparisons, clean committed rerun, personal agent-team account, peer notes and recording remain submission work.
