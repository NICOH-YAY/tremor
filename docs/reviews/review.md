# Independent review of Tremor (second pass), 2026-10-31

## Scope

- Repo `D:\Coding VS\tremor`, HEAD `9927bfe` ("A-proofing: fix review leaks ..."), working tree clean at review time.
- Reviewer: a fresh read-only agent session that did not write the code and was given no instruction to approve. The only file written is this one.
- Reviewed against the prior review (`independent-review-2026-10-31.md`), the author response (`review-response-2026-10-31.md`) and `docs/RUBRIC-CHECKLIST.md`.
- A live evaluation (`npm run eval:live`) was running in the folder; `eval/traces` and `eval/results` were only read, never modified.

## Method

Read: `src/player_interface.ts`, `src/eval/*`, `src/agent/*`, `scripts/eval.ts`, `scripts/report-evaluation.mjs`, `engine/tremor/{agent_api.c,tremor.c,tremor.h,tests.c}`, relevant `p_inter.c`/`p_mobj.c`/`p_pspr.c`/`am_map.c` hooks, all five test kinds, three workflows, README, AGENTS, RULES, DESIGN, DECISIONS, CONTRACTS, EVALUATION-PLAN, EVALUATION.md, rule-source-map, THIRD-PARTY, art CREDITS, SKILL-INVOCATIONS, HORROR-STATUS, BASELINE-DIAGNOSIS.

Ran (all once, nothing heavy): `vitest run` (9 files, 43/43 passed, 9.3 s), `tsc --noEmit` (clean). Scripted checks: parsed the 285-row sample trace for observation size; read the in-progress live model trace (64 rows) for token and latency figures; parsed `freedoom1.wad` THINGS lumps for E1M1-E1M9 (no chaingunners; 12-68 pistol and 13-99 shotgun humans per map); searched the shipped WASM for id strings; searched tracked docs for mojibake, `?` dash corruption and drive-letter paths (none found).

Not done: no emsdk rebuild, no browser play, no `npm run build`, no `engine:test` (it is called through `agent.test.ts`, which passed), no live Vertex call by me.

## Summary verdict

The fixes claimed for the previous Major findings are real and verified in code and tests (purge channel, terror and drop parity, baseline regression, CI C-suite, 8-bit seed note, gore RNG, heal cap, per-step events). No new hidden-information leak was found beyond ones the docs disclose. The remaining risk is mainly **evidence, cost and docs hygiene**, not game correctness. There are no Blockers. Three items are Major for grading: the live model prompt size/cost, one stale status doc contradicting the README, and the rubric's "two sessions" skill requirement.

## Findings

### Blocker

None.

### Major

**M1. The live model prompt is about 10k tokens per observation (about 85k per call for model-history); there is no cost estimate, token cap or pre-flight, and the report cannot compute cost.**
- Evidence: observation `summary` includes the whole 257x257 automap, 67.8k characters per row (sample trace `eval/traces-sample/baseline-death.jsonl.gz`: max 67,810, mean 67,232). `src/agent/model_player.ts:10` sends the current summary plus K=8 prior summaries. The in-progress live trace (`eval/traces/2026-10-31T06-04-04-607Z-model-history-E1M1-17.jsonl`) shows `tokensIn` of 10,296 on call 1 and about 84-86k from call 9 onward (mean about 80k), latency about 2.5 s, and about 25 output tokens. At 600 calls x 28 episodes this order of magnitude is roughly 1.4 billion input tokens for model-history alone. `runner.ts:32` hard-codes `estimatedCost: controller.model?null:0`, `scripts/eval.ts:37` says "pricing unverified", and `EVALUATION.md` has no cost for any model row. The rubric requires "estimated cost with dated prices".
- Risk: cost could be surprising (verify against current Vertex pricing before the run completes), and 20 s per-call timeouts are close to the plausible tail for 85k-token prompts (one timeout ends the episode, see m1).
- Fix: (a) crop the automap in the prompt (for example 41x41 around the player, or run-length encode `?`) identically for both memory conditions, and declare that amendment before more live trials; (b) add a dated price constant in `scripts/eval.ts` and compute `estimatedCost` from `tokensIn/out`; (c) add a max-token or max-cost abort per run; (d) record `unknownUsageCalls` in the table.

**M2. `docs/HORROR-STATUS.md` is stale and contradicts the current README/EVALUATION.**
- Evidence: line 3 "This follow-up is uncommitted"; line 67 "npm test: 120 passing plus one explicit TODO"; "engine:test: 470 checks"; line 81 "Bot completion remains 0/20 ... 16 deaths/4 limits". Current truth is 43 tests / 508 C checks and 4/28 scripted exits. The review response claims "docs to one current state".
- Fix: rewrite it with current numbers, or move it under `docs/` history with a "superseded" banner as was done for `README-ts-superseded.md`.

**M3. The reusable skill is logged twice, but both invocations are in one session, which does not meet "invoked by name in >=2 sessions".**
- Evidence: `docs/SKILL-INVOCATIONS.md` ends with "These are two actual invocations in this session, not two invented sessions"; both entries are "Codex session codex-doom 12". The rubric (3d) says at least two sessions.
- The author says this plainly (good). The gap remains a rubric cap risk. Fix: invoke `tremor-level-check` in a genuinely separate session (for example after the next rule or controller change) and log it.

**M4. Design-rule rationale is boilerplate; `DESIGN.md` has no per-parameter justification.**
- Evidence: `docs/rule-source-map.md` has about 40 rows `TR_*` labelled `design` that all point to "[rationale](DESIGN.md)". `DESIGN.md` is 32 lines of prose and never explains why 90/256 crew, 31/256 drops, 64/256 ammo keep, 70-tic stun, 179 hit loss, 6 trauma cap or 350-tic decay. `TR_READ`/`TR_STUN`/`TR_PURGE` (values 1, 2, 4) are internal button bitmasks, not rules. Rubric 1a wants design rules pointing to the spec with rationale.
- Fix: add a short parameter-rationale table to `DESIGN.md` (value, effect on play, why this number); delete bitmask and render-only rows or label them "implementation".

**M5. The scripted baseline is only functional on E1M1.**
- Evidence: `EVALUATION.md`: 2/14 exits for each baseline, all on E1M1; 0/10 on E1M2-E1M7 (seen plus held-out 0/8). Most deaths occur within 46-300 actions. The response admits "Other maps may still fail". The rubric asks for a "cheap credible baseline" and a comparison on held-out cases; with 0/8 the held-out comparison has almost no signal on exits (route %, health and kills still differ).
- Not a correctness bug. Either improve survival, or state in README/EVALUATION that comparisons on seen/held-out maps are on route progress, not completion (EVALUATION partly says this).

**M6. The committed evaluation result is not tied to the committed code.**
- Evidence: `EVALUATION.md` cites HEAD `c6316ff...` with working tree "dirty"; HEAD is now `9927bfe` and the tree is clean. The cited run (`...T05-54-45-516Z`) is from 01:54 -0400, before the 02:03 commit. The author knows (response B2: "NOT DONE: clean committed evidence").
- Fix: after the live run finishes, rerun the frozen baseline command at a clean commit and regenerate EVALUATION.md (`revision` and `workingTree` fields will then be `9927bfe`/`clean`). Also note `eval.ts:32` reads revision and dirty state at the end of the run, not at the start; if files change during a long live run the stamp can be wrong. Read them before the loop.

### Minor

**m1. One slow call ends the whole episode.** `runner.ts:22` calls `terminate(world,'timeout')` on a single per-call timeout (20 s). Documented ("Timeouts terminate"), but with 85k-token prompts a single latency spike loses the episode. Consider counting the call as a failed call (no world step, no terminate) and reserving `timeout` for the 300 s episode cap, or at least report per-call vs episode timeouts separately.

**m2. C hard-codes the step cap.** `agent_api.c:91` `if(++steps>=600&&!terminal)terminal=3;` ignores the runner's `maxSteps`. A caller passing `maxSteps>600` is silently capped (reason still `step_limit`); `maxSteps<600` works. Contract/README say 600, so this is consistent for the declared suite, but the option is misleading. Either remove the option or pass the cap into `tremor_agent_reset`.

**m3. Model configuration is under-recorded and the model path has no test.** `model_player.ts:10` sets no temperature or seed (default sampling, non-reproducible); the location fallback `global` -> `us-central1` mutates mid-run and is not recorded; `scripts/eval.ts:37` writes `model:'gemini-3.5-flash-lite'` even for baseline-only reports. No test covers `modelPlayer` (JSON parse failure, empty action, location fallback, history window) with a mocked client; CI only exercises hand-written fake controllers. Fix: inject the client for tests, record temperature/location in `config`, and set an explicit temperature.

**m4. `rounds` at tic 0 equals hostile count + 1** (`tremor.c:66`). Disclosed (README, CONTRACTS, DESIGN, response m6), and not an unread-identity oracle for any single figure, but it is exact aggregate hidden information. With visible human counts it bounds the number of possessed humans. Consider adding a note to the model prompt/analysis; or start rounds from a fixed per-level constant.

**m5. Shared route cue and objective text reveal unseen geometry and key locations.** Disclosed as designed and shared with human TAB; `objective` strings such as "Find the red keycard" depend on item positions anywhere in the level. Acceptable given the documentation; keep the limitation visible in EVALUATION.md because it makes "observation-only" memory comparison easier than a vision-only game.

**m6. README source path is wrong.** `README.md:91` says "distributed as engine/source.zip"; the file is `public/engine/source.zip` (`engine/build/build.py:24`, `public/engine-headless/artifacts.json`). `engine/source.zip` does not exist.

**m7. Rule-map labels.** The "Crew fraction | observed" row (`rule-source-map.md:18`) cites "seed tests", but no test measures the crew fraction (grep found none), and the same constant is labelled `design` two rows later. "Controls/player manual | manual" points to the project's own RULES.md, which is circular; label it `design`. The ammo "backpack 8 (four grants of 2)" matches `p_inter.c:75` and `tests.c` loop; fine.

**m8. EVALUATION.md markdown table is malformed.** The Player table header has 11 columns and the separator has 12 (`scripts/report-evaluation.mjs` header array). Renders oddly on GitHub. Also "pricing unverified" row text duplicated for pending rows; fine.

**m9. "Hidden browser <=1Hz" in the review response is not what the code does.** `tremor.c:379` uses a 35-tic interval when the automap is closed (1 Hz at game speed, only while tics advance) and `horror.js:41` polls `_tremor_story` every 250 ms regardless of visibility. There is no visibility-based throttle. In headless the gate `interval=7` equals the step size, so route gating gives no reduction for agents (the saving is the static geometry cache). The response admits the BFS stays synchronous; just correct the wording.

**m10. Latent identity channel for chaingunners.** `TR_Human` (`tremor.c:50`) includes `MT_CHAINGUY` but `TR_MapSpawn` only makes POSSESSED/SHOTGUY crew, so an "unknown figure" chaingunner would always be possessed. Not reachable in Freedoom Phase 1 E1M1-E1M9 (verified from THINGS lumps: zero type-65 things), so no impact on this suite. Add a comment or include chaingunners in `TR_MapSpawn`.

**m11. `ROUTE_MAX` early return keeps a stale cue.** `tremor.c:384`: if the lattice exceeds 1,048,576 cells the function returns with the previous `route_x/y`. Fine on Episode 1 maps; mention in docs, or reset the route to the straight bearing.

**m12. Test fixtures ship to Pages.** `public/engine-headless/doom-test.wasm` (exports `tremor_agent_fixture`, test_kill, etc.) is copied into `dist/`. Controllers use `doom.cjs`, so this is not an agent leak, but the "production omits fixtures" test covers only `doom.cjs`. Consider excluding `doom-test.*` from the Vite publish directory.

**m13. Residual id-era strings in the WASM.** The headless/browser WASM still contains "Hell on Earth", "Ultimate DOOM", "Shores of Hell", "Inferno", "Doom Shareware" (game-mode and episode names compiled into GPL source). No "id Software", "ZeniMax" or proprietary text were found. These are GPL code constants, not copyrighted data; the claim "id strings removed" in the response should say "displayed text replaced via Freedoom BEX; internal mode names remain".

**m14. Committed result clutter.** `eval/results/` holds about 15 exploratory result and table files (including `pre-route`, `pre-survival`, `first-followup`, `compatibility-pass`). `EVALUATION.md` links one. Add a short `eval/results/README.md` index saying which is final and which are development runs, or prune.

**m15. Submission-copy hazards.** The repo root has `.github/workflows/ci.yml` and `pages.yml`; the course PR may add only the `midterm-nicoh-yay.yml` workflow. The midterm workflow itself is correct (working-directory and `cache-dependency-path` are `midterms/nicoh-yay`; Node 24; `npm ci`, `npm test`, `npm run typecheck`, `npm run build`), but it does not run `npm run engine:test` (covered through `agent.test.ts`). `.npmrc` `cache=.npm-cache` is relative and harmless, but `setup-node`'s cache lookup runs at checkout root.

**m16. Small runner points.** A key picked up on the final step is not counted in `objectivesReached` (observe happens before each decision only). After 3 consecutive invalid actions the fallback `wait` adds a further 7-tic step (labelled and counted; fine). The runner never feeds `outcome()` to controllers (verified).

## Verified fine (with evidence)

1. **Purge identity-neutral, full 35-tic channel.** `tremor.c:154-160`: completion at `purge_tics>=TR_PURGE_TICS` for either identity does identical things: `TR_Radio(3)`, queues `crew-ammo` line, `--tr_charges`, `TR_Ammo(p,3)`, `tr_crew=1`, `tr_revealed=1`, same message, same `totalkills` handling guarded by flag. Only `tr_saved` (evaluator-only, in `outcome()` not `observe()`) differs. The regression (`agent.test.ts` "stun/purge validation and observations do not reveal an unread identity") starts from full unstunned unread fixtures (stun 0) for crew=1 and crew=0, issues STUN then six PURGEs (the first two interrupt-neutral), compares complete observations per step including `radio_log`, and asserts purge 1, rounds 28, entity `crew`. The claim that the old test failed at tic 42 is recorded in `SKILL-INVOCATIONS.md`; I did not re-run the pre-fix binary.
2. **STUN and READ.** STUN effect (`TR_STUN_TICS`, cooldown) is identity-independent (`tests.c` stun checks for both). READ reveals only after 35 consecutive tics (`tremor.c:147`); the radio line `crew-reveal` for crew only comes after that reveal, so it adds no pre-reveal information. A test confirms pre-35 observations match.
3. **Terror/drop parity.** `corpses()` (`tremor.c:107-124`) has no identity term; `TR_Kill` (`tremor.c:176-196`) draws the same `P_Random()<TR_AMMO_DROP` for all humans; `tests.c` loops five starting terror levels (0/24/49/79/99) x crew in {0,1} with once-only exposure and matched 256-trial drop counts. Human-death radio is neutral (`TR_Radio(2)` for any human).
4. **Gore RNG isolation.** `TR_Kill` saves and restores `prndindex` around `P_SpawnMobj` (gameplay RNG), uses `M_Random` for cosmetics; `tests.c` compares next `P_Random` roll with gore on/off.
5. **Heal cap.** `TR_Kill` only heals when `p->health<TR_HEALTH_CAP`; tested at 95 -> 100 and 150 -> 150.
6. **Corpse scan.** Cursor walks the thinker list, 64 visits / 8 LOS tests per tic, `TR_CorpseRemoved` hook in `p_mobj.c:579` prevents a stale cursor, `TR_LevelStart` and `TR_InvalidateStory` reset it. The fresh/close bonus now survives.
7. **Per-step events.** `agent_api.c` clears messages at each `tremor_agent_step` start; `step()` returns only that step's displayed messages (HUD-sourced via `hu_stuff.c:424`). Radio history is a separate persistent field.
8. **legal_actions constant.** `player_interface.ts` returns all 40 IDs for any state, throws on unknown player/state; invalid actions idle seven tics identically; known-but-ineffective actions (purge with no target) are valid with no feedback difference. Test "has five operations..." executes every action and asserts 7 tics each.
9. **Observation boundary.** Test "controllers receive only public view..." asserts exact key sets for `Observation`, `summary` JSON and entities. `outcome()` is runner-only. Entities use the 90 degree cone plus `P_CheckSight`; dead actors excluded; observe is pure (extra-observe test passes).
10. **Runner limits and accounting.** Step, call, per-call timeout, episode wall-clock and natural-terminal precedence are implemented (`runner.ts:14-22`) and tested (limits, failed model calls counted with no world step, malformed response retains tokens, fallback labelled `source:'fallback'`, replays labelled `replay-mocked`, errors sanitised to a fixed string). Model moves are counted only from `source==='model' && valid`.
11. **Reproducibility.** Seed modulo 256 is documented and tested (17 == 273, 17 != 83, 100-step multi-level replay); independent WASM instances give identical traces; `scripts/eval.ts` records config, suite, controller source hashes, artifact hashes, `configId`, revision and dirty state, date+runId filenames, traces gzipped with hashes in `eval/traces-sample/manifest.json`.
12. **Efficiency and mechanics.** Asyncify absent (no flag in `build.py`; BUILD.md); hold-TAB implemented (`am_map.c` keydown start, repeat held, keyup stops); route lattice caches static walls and re-reads dynamic heights; observation does not call `route_update` in headless; `tests` verify pause-preview and double-init in production WASM. Freedoom BEX text override is present (977-line generated header; `TR_String` gated on the `FREEDOOM` lump). I did not measure performance myself; the response's before/after numbers are plausible but unverified here.
13. **Five CI kinds exist and assert behaviour** (`tests/README.md` is accurate against the files): invariants (`tests.c` through `tremor_test()`, plus rounds/trauma/health/crew-damage), legal/illegal (unknown action/player, constant vocabulary), terminal success (real normal-spawn careful baseline exits E1M1 seeds 17 and 83, `baseline.test.ts`, plus the exit-switch fixture), observed regressions (purge oracle; hyper-gore sprite crash; double-intro; malformed-WAD audio leak; pointer-lock), episode limits. Full run: 43/43, typecheck clean.
14. **Docs vs code (current set).** README rules, numbers, commands and exclusions match `tremor.h`/`tremor.c` (90/256, 35/70/35 tics, 2 charges, +3 rounds, 64/256 ammo keep, 31/256 drops, hit 77/256, 1.6x at fear 100, 40 actions, 257x257 at 16 units, 600/600/20 s/300 s). `ACTION_IDS` order matches `agent_api.c` cases and the CONTRACTS/rule-map ABI tables. Rule-map code locators all resolve (checked 16 upstream symbols and 5 Tremor symbols). DECISIONS names an alternative beaten for each choice. EVALUATION-PLAN has a current declaration, an amendment table and a labelled History section; E1M6/E1M7 are declared fresh held-out with E1M4/E1M5 marked seen. EVALUATION.md is candid (4/28 exits, model rows "pending live run", dirty tree, cost unverified, no human playthrough claim). No mojibake or `?` dash corruption found in tracked docs; no drive-letter paths in tracked sources.
15. **Licensing and credits.** LICENSE (GPL), THIRD-PARTY (doomgeneric pinned commit, Freedoom 0.13.0 BSD with modified sprites, Nuked OPL3 LGPL with relink inputs, Emscripten, npm, Higgsfield with terms URL and date), `public/art/CREDITS.md` lists all ten generated files and the terms section; README separates GPL code from creative assets and disclaims affiliation. Source archive ships at `public/engine/source.zip` and is in the hash manifest.
16. **Fresh clone and course folder.** `public/engine*`, `public/wad/*`, `source.zip` and manifests are tracked; `.gitattributes` forces LF on manifest-listed text; the manifest test verifies every listed byte; tests need no emsdk; `npm run eval` and CI use relative paths only; the midterm workflow uses `working-directory: midterms/nicoh-yay`. The response says a scratch copy under `game-dev-f26/midterms/nicoh-yay` passed; I did not repeat that.

## Suggested order before submission

1. M1 (prompt size, cost computation) before the live run is relied on for the report; amend the plan if the prompt changes.
2. M6 (clean committed rerun) after the live run, then regenerate EVALUATION.md.
3. M2 and M4 (docs), M3 (second skill session), m6 and m8 (small doc fixes).
4. m1, m2, m3 (runner/model-player hardening) if time allows.
