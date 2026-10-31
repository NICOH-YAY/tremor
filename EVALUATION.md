# Evaluation - 2026-10-31 live declared suite

Primary evidence: the human ran `npm run eval:live` from clean committed revision
`8f0e4a9dc937904ec47b1fe00045315330a112ae` (`8f0e4a9`). Run ID: `2026-10-31T06-19-01-385Z`.
[Full results JSON](eval/results/2026-10-31-2026-10-31T06-19-01-385Z-results.json) and [runner per-episode table](eval/results/2026-10-31-2026-10-31T06-19-01-385Z-table.md) record all 56 episodes, including failures; no players were skipped and model rows are live, not mocked.
Earlier baseline-only reports are superseded as current evidence; their dated files remain in `eval/results/` and their work records in [SKILL-INVOCATIONS](docs/SKILL-INVOCATIONS.md).

Configuration ID: `faebcbfb97da87f4e3953745bc163d276f15e2e22c506ee9a343582eb8d6a363`. Vertex `gemini-3.5-flash-lite`, project `game-dev-f26-nak2173`, location `global`, standard tier, temperature 0.2; history K=8 versus observation-only, shared lossless prompt encoding. Skill index 2, 40 constant seven-tic actions. Limits: 600 actions, 600 controller calls, 20 seconds/call, 300 seconds/episode. Failed calls consume budget. Natural exit/death takes precedence over later limits.

Tuning: E1M1-E1M3; seen: E1M4-E1M5; held-out: E1M6-E1M7, frozen before model trials. Each map/player has two trials, RNG starts 17/83. Starts are 8-bit: modulo-256 equivalent seeds are identical, not new independent trials. See the [declared hypotheses and amendment history](docs/EVALUATION-PLAN.md).

## Current results

All counts below are computed from the primary JSON. Reproduce both tables offline:

```sh
node --import ./scripts/typescript-loader.mjs scripts/summarize-results.ts
```

Pass a results JSON path to summarize another report; append `--json` for unrounded aggregates. [Aggregation source](scripts/summarize-results.ts) makes no API calls.

| Player | Episodes | Exits | Deaths | Step limits | Call limits | Call timeouts | Episode timeouts | Illegal | Errors | Fallbacks | Model calls | Mean latency ms | Tokens in/out | Est. USD | Crew killed/saved | Reads | Fired unread | Objectives | Final terror |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline_aggressive | 14 | 2 | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.08 | 0/0 | 0.000000 | 17/0 | 0 | 25 | 2 | steady: 14 |
| baseline_careful | 14 | 2 | 10 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0.08 | 0/0 | 0.000000 | 5/0 | 18 | 22 | 2 | steady: 14 |
| model-history | 14 | 0 | 6 | 0 | 0 | 0 | 8 | 3 | 20 | 0 | 3675 | 919.99 | 14421537/119947 | 4.626329 | 0/0 | 7 | 0 | 0 | steady: 14 |
| model-obs-only | 14 | 0 | 7 | 0 | 0 | 0 | 7 | 0 | 11 | 0 | 3227 | 909.63 | 10136269/119304 | 3.339141 | 0/0 | 3 | 14 | 0 | steady: 14 |

| Player | Split | Episodes | Exits | Deaths | Step limits | Episode timeouts | Steps | Mean route % | Objectives | Crew killed/saved | Reads | Fired unread |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline_aggressive | tuning | 6 | 2 | 2 | 2 | 0 | 1997 | 46.50 | 2 | 12/0 | 0 | 19 |
| baseline_aggressive | seen | 4 | 0 | 4 | 0 | 0 | 645 | 14.75 | 0 | 4/0 | 0 | 0 |
| baseline_aggressive | held-out | 4 | 0 | 4 | 0 | 0 | 395 | 28.00 | 0 | 1/0 | 0 | 6 |
| baseline_careful | tuning | 6 | 2 | 2 | 2 | 0 | 2391 | 43.00 | 2 | 4/0 | 11 | 18 |
| baseline_careful | seen | 4 | 0 | 4 | 0 | 0 | 428 | 19.00 | 0 | 0/0 | 2 | 0 |
| baseline_careful | held-out | 4 | 0 | 4 | 0 | 0 | 608 | 36.50 | 0 | 1/0 | 5 | 4 |
| model-history | tuning | 6 | 0 | 2 | 0 | 4 | 1790 | 11.33 | 0 | 0/0 | 4 | 0 |
| model-history | seen | 4 | 0 | 2 | 0 | 2 | 1079 | 3.00 | 0 | 0/0 | 1 | 0 |
| model-history | held-out | 4 | 0 | 2 | 0 | 2 | 786 | 3.00 | 0 | 0/0 | 2 | 0 |
| model-obs-only | tuning | 6 | 0 | 1 | 0 | 5 | 1758 | 12.33 | 0 | 0/0 | 2 | 6 |
| model-obs-only | seen | 4 | 0 | 3 | 0 | 1 | 574 | 7.25 | 0 | 0/0 | 0 | 4 |
| model-obs-only | held-out | 4 | 0 | 3 | 0 | 1 | 884 | 3.00 | 0 | 0/0 | 1 | 4 |

Mean latency is total controller-decision milliseconds divided by controller calls (including failed calls), not the average of episode averages or engine frame time. Baseline model calls are zero; their controller calls are nonzero. Counts are sums except the explicitly labelled means and final-terror bucket distribution. Split denominators are 6 tuning, 4 seen and 4 held-out per player.

Every model `timeout` terminal was the **five-minute episode wall-clock cap**: history 8, observation-only 7; **callTimeouts is 0** throughout. History recorded 20 errors and observation-only 11, separate from 3/0 illegal actions. Neither condition triggered fallback moves. These failures remain included.

Estimated USD uses the run's verified **2026-10-31** prices: $0.30 per million input tokens and $2.50 per million output tokens ([recorded Vertex price source](https://cloud.google.com/vertex-ai/generative-ai/pricing)); cached input was unused. Formula: `(tokensIn * 0.30 + tokensOut * 2.50) / 1,000,000`. These are estimates from recorded usage, not invoices. History has 12 unknown-usage calls and observation-only 8. Unknown-usage failed calls make model costs lower bounds; see JSON for per-episode accounting. Baselines use no API and cost zero.

## What the experiment shows

The [declared plan](docs/EVALUATION-PLAN.md) states three hypotheses:

1. **Reading reduces fired-unread and crew deaths.** Careful recorded 18 reads versus aggressive's 0, 22 versus 25 fired-unread, and 5 versus 17 crew killed, with the same 2/14 exits. This is descriptively consistent with the hypothesis across the whole suite, but the controller policies differ beyond reading and this does not isolate a causal effect. History recorded 7 reads, 0 fired-unread and 0 crew killed; observation-only recorded 3 reads, 14 fired-unread and 0 crew killed. Firing unread did not necessarily kill crew.
2. **Mercy saves crew at a step cost.** All four players saved zero crew. This run demonstrates neither successful mercy nor its proposed step cost. Careful used 3427 steps versus aggressive's 3037, but those extra steps cannot be attributed to successful mercy.
3. **Bounded history improves navigation/completion under partial observation.** Both model conditions exited 0/14 and reached zero secondary objectives. History had 6 deaths and 8 episode timeouts; observation-only had 7 deaths and 7 episode timeouts. History's mean route progress was lower on tuning (11.33% versus 12.33%) and seen maps (3.00% versus 7.25%), and equal on held-out maps (3.00%). There is no demonstrated navigation/completion advantage for K=8 here. History used more recorded input tokens and cost more. A timeout while alive is not completion or proof of better survival skill.

Only scripted E1M1 episodes exited. No player completed a seen or held-out map. These are descriptive results, with no significance claims: two trials per map/player and 8-bit RNG starts do not support broad generalization. No controller or prompt changes were made from these outcomes.

## Representative live traces

Both samples use E1M1/17 for a matched map/seed comparison, chosen to show the common episode-cap failure, not successful completion. They are complete public-observation/action JSONL streams copied without recompression from this run:

- [model-history, E1M1/17, timeout](eval/traces-sample/model-history-E1M1-17.jsonl.gz); SHA-256 `d8ef5acf3bc513604d2722639b9a5deda2bdd31ca0c4e3d38e9456873f8d1c0d`.
- [model-obs-only, E1M1/17, timeout](eval/traces-sample/model-obs-only-E1M1-17.jsonl.gz); SHA-256 `04dd986103a68dfc2b0a1e30c38dc02cdd0178592be77c7237471145b8979847`.

[SHA-256 manifest](eval/traces-sample/manifest.json) records each source run/report; retained baseline samples are explicitly from the older baseline run. Raw full-run traces remain ignored in `eval/traces/`.

## Artifact provenance

The primary JSON records controller/interface source hashes as well as these artifact SHA-256s:

| Artifact | SHA-256 |
|---|---|
| `public/engine-headless/doom.cjs` | `48da089632b8b93d3870e94844d373c07f522e5b6f5e0b45c7afa2f966452595` |
| `public/engine-headless/doom.wasm` | `d60641d76c3474becdd5440efb4f31469b77cf7ff027662e9e73ce1ef6a6e8d8` |
| `public/wad/freedoom1.wad` | `7323bcc168c5a45ff10749b339960e98314740a734c30d4b9f3337001f9e703d` |
| `public/wad/tremor.wad` | `ed554eef927c0f19c7554230f54747dad8ba6b8b3ac84a35b2dc99afd5652031` |

Engine and Freedoom provenance/licenses remain in [UPSTREAM](engine/UPSTREAM.md) and [THIRD-PARTY](THIRD-PARTY.md). No proprietary IWAD assets are used.

## Known limitations (facts)

- E1M4/E1M5 results were already inspected; only E1M6/E1M7 were fresh held-out model maps. Tuning and historical fixed-seed diagnostics are not additional independent trials.
- Two seeds per case, one model/configuration and one skill level limit generalization. Policies differ in action choices and wall-clock exposure; aggregates do not isolate reading or memory causally.
- Model episodes are bounded by real elapsed time; 15 reached the five-minute cap before completion. Failed calls can have unknown billed usage; costs may undercount.
- Route progress is an evaluator-only sector-hop distance proxy, ignoring locks/heights, not proof of traversability. Secondary objectives count distinct key types collected plus exit; switch-only subtasks are excluded.
- Public route guidance reveals unseen geometry and key dependencies. Agents receive public textual observations and macros rather than human pixels/audio; this is not vision-only navigation.
- Zero crew saves and uniformly steady final terror do not establish mercy effectiveness or fear-system behavior across other conditions. Final buckets do not describe the full episode trajectory.
- Software-render benchmarks in historical records exclude Canvas/DOM/audio and are not target-browser measurements. A full human episode and visual/audible playtesting remain separate evidence.

## Limitations (in Nicoh's words)

TODO: Nicoh to write his own limitations and reflection here.

Validation for this documentation/evidence update: `npm test` (50 tests, 10 files), `npm run typecheck`, `npm run build`, and `npm run engine:test` (508 checks, 0 failures) passed. Build retains the existing `art/title.jpg` resolution warning. Sample gzip integrity, source-copy equality, manifest/artifact SHA-256s, cost calculations and reproduced Markdown tables were checked offline. No new evaluation runs, gameplay/controller changes or commits.
