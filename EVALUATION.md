# Evaluation - 2026-10-31 live declared suite

Primary evidence: the human ran `npm run eval:live` from clean committed revision
`8f0e4a9dc937904ec47b1fe00045315330a112ae` (`8f0e4a9`). Run ID: `2026-10-31T06-19-01-385Z`.
[Full results JSON](eval/results/2026-10-31-2026-10-31T06-19-01-385Z-results.json) and [runner per-episode table](eval/results/2026-10-31-2026-10-31T06-19-01-385Z-table.md) record all 56 episodes, including failures; no players were skipped and model rows are live, not mocked.
Earlier baseline-only reports are superseded as current evidence; their dated files remain in `eval/results/` and their work records in [SKILL-INVOCATIONS](docs/SKILL-INVOCATIONS.md).

Configuration ID: `faebcbfb97da87f4e3953745bc163d276f15e2e22c506ee9a343582eb8d6a363`. Vertex `gemini-3.5-flash-lite`, project `<your-gcp-project>`, location `global`, standard tier, temperature 0.2; history K=8 versus observation-only, shared lossless prompt encoding. Skill index 2, 40 constant seven-tic actions. Limits: 600 actions, 600 controller calls, 20 seconds/call, 300 seconds/episode. Failed calls consume budget. Natural exit/death takes precedence over later limits.

Tuning: E1M1-E1M3; seen: E1M4-E1M5; held-out: E1M6-E1M7, frozen before model trials. Each map/player has two trials, RNG starts 17/83. Starts are 8-bit: modulo-256 equivalent seeds are identical, not new independent trials. See the [declared hypotheses and amendment history](docs/EVALUATION-PLAN.md).

## Current results

All counts below are computed from the primary JSON. Reproduce both tables offline:

```sh
# cwd: midterms/nicoh-yay
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

[SHA-256 manifest](eval/traces-sample/manifest.json) records each source run/report; retained baseline samples and the served baseline-success replay are from revision 203810d, run 06-16-26-402Z, stamped workingTree: dirty. All 28 baseline outcomes and metrics match the clean 8f0e4a9 run (see codex-doom18 evidence). Raw full-run traces remain ignored in `eval/traces/`.

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

## Spectator replay verification

Spectator evidence added 2026-11-02: [Watch the agent](public/watch.html) replays
the two committed LIVE model samples and the aggressive baseline success through
the real browser agent macros. It makes no new model calls. All three matched
their original report terminal status/reason/score and every metric in both
headless and browser-spectator modules: history timeout at tic 1603, health 100;
observation-only timeout at tic 1876, health 104; baseline exit at tic 805, health 71.
Original trace reasons were not retained and are labeled unavailable. These are
deterministic replay checks, not additional trials. Current validation is recorded in [the final review response](docs/reviews/review-final-response.md): tests,
typecheck, build, and 508 engine checks pass. See the
[recording guide](docs/RECORDING-GUIDE.md) and [session result](docs/agent-sessions/codex-doom17-result.md).

## Limitations (in Nicoh's words)

None of my agents were able to finish a lot of levels. Scripted bots were able to exit 2/14 runs and the Gemini player exited 0. This is because the Doom levels themselves have doors, keys and dead ends and with the fear mechanic (that makes them miss a shot on purpose when really scared) I watched the bot basically get bum rushed by enemies and miss everything (which was pretty entertaining), but it's a pretty hard game.

Each of the tests I ran were only run twice, so the number of tests is relatively small and I can't make any statistical claims from them. The seed also only changes the random start, so two runs of the same level are pretty similar. But I think it's still enough to check the basics of how the game works and that the mechanic behaves the way I designed it, which was my main goal. The human playtests (me and friends I showed the game to) showed the mechanics worked, even if they weren't always clear, since players didn't notice the ammo limit until they ran out and guessed at what the fear effect was.

The game is hard, my last playtester said that too. Especially on a laptop since I watched them on their little Mac trackpad trying to shoot the thing which was slow and clunky and they ended up dying a lot. It's a lot easier when there is a separate mouse to play and I can get through each level pretty quickly myself (but when I tried on their Mac I died so fast). I left it that hard because I think the core idea of what I was getting at was DONE successfully. The longer you take the more bodies you see/people you kill the harder the game gets naturally as the more scared you get and the more likely you are to miss a shot. That plus the music adds to a very cool atmosphere that feels rewarding when you finally beat the level.

If I had more time though, I would probably change the rates of ammo and make fear come in slower. Perhaps only after seeing a bunch of bodies. OR maybe interestingly you start off scared but once you kill a bunch of monsters you get more confidence and like less fear which is an interesting idea to explore.

The first thing I would fix is the spawns of some enemies. There's an enemy that spawns on top of the box which you can only kill if you have a gun so if you ran out of bullets you basically enter a room of you getting shot at and you can't do anything. But I tested with guns and it's possible to kill the enemy. I left it in originally since I thought it would incentivize after a couple runs of a player to be even more thoughtful with their bullets.

### Facts for the limitations paragraph

The known-limitations section above records measured constraints. The [uploaded agent recording](https://drive.google.com/file/d/1-gUtdHicrsxu483OgbBwNUdB4stBCUJH/view?usp=sharing) is viewable by anyone signed in with a columbia.edu account and is described in [recordings/README.md](recordings/README.md). The instructor's Nov 4 2026 update allows human playtest notes from anyone (classmate, friend or family), and the notes are in [docs/playtests/README.md](docs/playtests/README.md). The optional demo is outside the declared suite and does not change its counts.

Historical validation for the evaluation documentation/evidence update at 13856cb: `npm test` (50 tests, 10 files), `npm run typecheck`, `npm run build`, and `npm run engine:test` (508 checks, 0 failures) passed. Build retains the existing `art/title.jpg` resolution warning. Sample gzip integrity, source-copy equality, manifest/artifact SHA-256s, cost calculations and reproduced Markdown tables were checked offline. No new evaluation runs, gameplay/controller changes or commits.

## Evaluated and submitted versions

| Version | Revision |
|---|---|
| Game version evaluated | 8f0e4a9dc937904ec47b1fe00045315330a112ae |
| Submitted version | Tremor 9e06475 plus this documentation-only CI evidence update; course PR #67 head |

Changes since evaluation are music/presentation, the startup fix, the watch page, documentation, trace reason retention and hint placement. The model prompt, action interface and simulation behavior are unchanged. Spectator audio is enabled only when a presentation audio bridge is supplied; the evaluated headless path retains -nosound. Raw SHA-256 checks against the primary JSON on 2026-11-02 give:

| Artifact | Compared with evaluated bytes |
|---|---|
| `public/engine-headless/doom.cjs` | unchanged |
| `public/engine-headless/doom.wasm` | unchanged |
| `public/wad/freedoom1.wad` | unchanged |
| `public/wad/tremor.wad` | unchanged |

The engine-headless WASM and both WAD hashes are unchanged. Browser music artifacts changed after evaluation. The offline summarize command above also works from the Tremor root.

## Course CI evidence

The course workflow runs npm ci, npm test, npm run typecheck and npm run build. tests/agent.test.ts invokes the C checks using shipped test WASM. Historical fork evidence is [41244931991](https://github.com/NICOH-YAY/game-dev-f26/actions/runs/41244931991) at c042ec0. This earlier run is not final-version CI evidence. All checks passed on course commit `95a2899`, synced from Tremor revision `9e06475`, in [course PR #67](https://github.com/columbia-university-ai-games/game-dev-f26/pull/67), including the [Midterm nicoh-yay verify run](https://github.com/columbia-university-ai-games/game-dev-f26/actions/runs/41889125996) and the [Minigame submission boundaries run](https://github.com/columbia-university-ai-games/game-dev-f26/actions/runs/41889126102).

For step/call/timeout endings, the recorded limit reason is applied to the replay; final tic, health and all other metrics are independently reproduced from the actions.

Source-hash caveat: src/player_interface.ts changed by moving the unchanged action list to src/agent/actions.ts and re-exporting it; src/eval/runner.ts changed only to retain the model reason in traces. These two recorded source hashes differ. Model policy, prompt and action behavior remain unchanged.
