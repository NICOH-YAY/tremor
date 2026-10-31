# Independent review of Tremor, 2026-10-31

Reviewer: a fresh read-only Claude Sonnet session. I did not write this code and was not asked to approve it. I changed no source, test or config file. The only repo file I created is this review. Probe scripts live in my scratchpad, outside the repo.

## Scope

- C: `engine/tremor/agent_api.c`, `tremor.c`, `tremor.h`, `tests.c`, and the Tremor hooks in `engine/doomgeneric/doomgeneric/` (`p_inter.c`, `p_pspr.c`, `p_mobj.c`, `p_saveg.c`, `hu_stuff.c`, `m_random.c`, `g_game.c`, `r_segs.c`, `p_setup.c`), plus `engine/PATCHES.md`.
- TS: `src/player_interface.ts`, `src/eval/runner.ts`, `src/eval/suite.ts`, `scripts/eval.ts`, `src/agent/*`.
- Tests: all of `tests/`, `.github/workflows/*`, `public/engine-headless/artifacts.json`, `engine/build/*.py|mjs`.
- Docs checked against code: `docs/CONTRACTS.md`, `DECISIONS.md`, `RUBRIC-CHECKLIST.md`, `rule-source-map.md`, `EVALUATION.md`, and the previous review.

## Method

- Read the sources above in full.
- Ran `node node_modules/vitest/vitest.mjs run` (D:\node.exe). Result: **122 passed, 1 failed** (see M1).
- Wrote and ran one probe (scratchpad `probe.cjs`) against the shipped `doom-test.cjs`. It runs a stunned unread human as crew and as possessed through `stun` then six `purge` steps, and compares observations. It also compares initial observations across seeds 17, 18 and 273.
- Checked mtimes of C sources against shipped WASM and the last C unit-test log.
- Did not run: the live Vertex path, the browser build, emsdk builds.

Git state: HEAD `93f5646`; working tree has one uncommitted change, `src/agent/baselines.ts` (+24/-6).

## Findings

### BLOCKER

None that corrupt the evaluation outright. The test-suite failure (M1) and the purge oracle (M2) are the closest. I rate both Major only because the C engine and the human UI give humans the same feedback. See the argument under M2.

### MAJOR

**M1. `npm test` is red in the working tree.**
`tests/baseline.test.ts:28-30` ("careful baseline completes E1M1 seed17") fails: `expected 'dead' to be 'exit'`. The failure follows the uncommitted `src/agent/baselines.ts` change (the committed `HEAD` version is what CI would run, and I did not run it). Either the in-progress baseline edit regressed or the test is seed/engine-sensitive. Before submission: revert or finish the edit, re-run, and record the pass.

**M2. Purge is a free identity oracle, and the "no leak" regression test cannot see it.**
Probe result, same unread human stunned then purged six times (fixture), same seed:
- crew: `rounds 25, purge 2, events [], entity "unknown figure"`.
- possessed: `rounds 28, purge 1, events ["Take these. Get out of here. +3 rounds"], entity "crew"`, plus `crew-ammo|` in `radio_log`.

Cause: `tremor.c:139-146` only advances purge on `!m->tr_crew`; success sets `tr_revealed`, adds 3 rounds, a message and a radio line. A crew target silently does nothing, costs no charge, and stays unread.
Consequence: stun then 5 purges (about 42 tics, no read) lets an agent learn identity and cure possessed targets in one action sequence, which makes READ largely redundant at melee range. `mercy` reads like a probe.
Mitigating argument: a human at the keyboard gets the same message, so this is not hidden from humans. It still contradicts the project's own stated invariant (`DECISIONS.md:5`, RUBRIC-CHECKLIST line 17: stun/purge must not reveal identity) and the prior review's B1, and `RULES` in `model_player.ts` tells the model "Crew need no purge".
Test gap: `tests/agent.test.ts` "regression: stun/purge validation..." steps `[11,12,12,12]`, i.e. three purges = 21 tics, below `TR_PURGE_TICS` (35). It also uses a fixture that pre-stuns both targets for 1000 tics (`agent_api.c:152`), so behaviour is matched artificially. "All actions have identical pre-reveal feedback" runs one step per action, so it cannot test held channels (read x5, purge x5). The test titles claim a property the engine does not have.
Fix, either way: (a) make crew purge succeed identically (same charge spend, message, radio) and differ only in the evaluator counter, or (b) declare purge an intentional identity probe in DECISIONS/README and drop the "never reveal identity" claims. In both cases extend the twin-world test to at least 6 consecutive purge steps and compare observations.

**M3. Terror bucket leaks crew-vs-possessed deaths at bucket boundaries.**
`tremor.c:108`: a seen corpse adds 3 if it is crew and died under 70 tics ago, 2 if a recent close non-crew kill, else 1. `observe()` exposes `terror` as 4 buckets (25/50/80). A player who shoots an unread figure then looks at the body gets a different terror delta depending on hidden identity. Only a bucket crossing is visible, so bandwidth is low, but it is a real identity side channel of the same class as the prior B1, and `rule-source-map.md:56` and `DESIGN.md` claim no hidden identity leaks. Also, crew drop no ammo (`tremor.c:181`) while possessed drop a clip 12% of the time (visible, probabilistic, same for humans).
Fix: give all fresh corpses the same increment, or drop the crew-specific +3. Add a twin test: kill unread crew vs possessed, compare `terror` over 100+ tics at several starting terror levels.

**M4. Docs contradict the code (a grader will notice).**
- `docs/CONTRACTS.md` and `DECISIONS.md:54-64`: "25x25 map, 64 units/cell", "17 IDs", "C enforces 600 actions", "no hidden exit/door tags exposed", "`Observation` has bearing/distance/type". Code: 257x257 at 16 units (`agent_api.c:20-21`), 40 IDs (`player_interface.ts:6`), step cap 1800 (`agent_api.c:79`), `elevation_deg`, exit direction supplied by `objective_bearing`.
- `rule-source-map.md:73`: "descriptive terror bucket is evaluation-only", but `terror` is in the observation (`agent_api.c:128`) and the model prompt.
- `DECISIONS.md:24`: "Crew and Possessed both consume a charge and channel", true only of the retired TS prototype (see M2).
- `CONTRACTS.md` also says outcome metrics and "numeric counters" are confined to `outcome()`, but `rounds` and `purge` (charges) are in the observation (arguably HUD, but not stated).
Fix: update the active-contract sections or mark them superseded.

**M5. C-level unit tests (`engine/tremor/tests.c`) are not in CI and not reproducible from a fresh clone.**
`npm test` is `vitest run` only. `engine:test` compiles with emsdk using hard-coded `D:\Python\python.exe` and `D:\Coding VS\tremor-tools\emsdk` (`engine/build/test.mjs:3`, `headless.py:12-13`). `tests.c` is not part of the headless test artefact (`headless.py` file list and `EXPORTED_FUNCTIONS` exclude `tremor_test`). So these assertions, which are the only direct tests of terror-once, hit-rate (70-85/256), `TR_Damage(100)==160`, ammo thinning, mercy rounds, save/load of rounds/charges/trauma/radio, and the radio cooldown, run only on the author's machine. Last recorded run: `engine/build/engine-test.log` 20:56 ("470 checks, 0 failures"), earlier than the last `tremor.c` edit (21:25), so there is no evidence it passes on the shipped source.
Fix: either export `tremor_test` from `doom-test.cjs` (add `tests.c` to the test build) and call it from vitest, or add an emsdk CI job. Re-run and log it against the final source.

### MINOR

**m1. Seed is only 8 bits.** `m_random.c:66`: `prndindex = seed & 255`. Probe: seed 17 and 273 give identical initial state; 17 and 18 differ. Only 256 distinct episodes per level exist, and the suite uses 2 seeds (17, 83). The contract documents "low eight seed bits", but `reset()` accepts any safe integer and `scripts/eval.ts` doesn't warn. Crew assignment (`TR_MapSpawn`, P_Random in `P_LoadThings`) is thus a 256-way function of seed. Add a test that seeds differing in the low byte differ and note it in EVALUATION.

**m2. Cosmetic gore consumes gameplay RNG.** `TR_Kill` (`tremor.c:183-195`) calls `P_Random()` for blood count, blood velocity and decoration choice, so gore setting changes later hit rolls, crew drops and outcomes. The patch notes admit it ("Hyper blood does consume P_Random") and demos record `tr_gore`. It violates the review criterion "cosmetic uses something else". Agent episodes are unaffected because gore is fixed at 2 (the agent never sets bit 64) but the human game differs per setting. Use `M_Random` for blood.

**m3. Kill-heal can reduce health.** `tremor.c:176`: `p->health=clamp(p->health+heal, TR_HEALTH_CAP)`; `clamp` is 0..100. With a soulsphere, megasphere or health bonuses above 100, any kill sets health to 100. The baseline actively seeks `soul sphere` (`baselines.ts`), so it can pick it up and lose it on the next kill. Fix: `max(p->health, min(100, p->health+heal))`.

**m4. Corpse scan latency makes the "freshly witnessed" bonuses unreliable.** `corpses()` scans 8 mobjs per tic, cycling through every thinker, including blood particles (8-16 per kill) and pools. On a map with ~500 mobjs a full cycle takes ~60 tics, close to the 70-tic freshness window (`tremor.c:108`). Removed thinkers shift the cursor, so some corpses are skipped for a whole cycle. Each corpse is still counted at most once (`tr_seen`, verified, and covered by `tests.c`), but a body that is in view briefly may never be counted. Consider scanning only mobjs flagged corpse via a list, or scanning at 32/tic.

**m5. Route/objective guidance is omniscient over unseen geometry.** `TR_StoryTick`/`route_update` run Dijkstra and a lattice BFS over the whole blockmap, scan all lines for the exit and all things for the key colour needed, and publish `objective` text ("Find the blue keycard", "Activate the route switch"), a bearing to the next waypoint, and a near/nearby/far bucket to the unseen target. This reveals that an unseen locked door lies on the route, where the nearest needed key is, and may route through secret two-sided doors (`ML_SECRET` is not excluded in `route_update`). The docs state this is the same public TAB cue humans get, and the project accepts it; but `DECISIONS.md:63` ("without privileged navigation") and `CONTRACTS.md` ("No hidden exit/door tags") are then inaccurate. Decide and document it as intentional guidance, and exclude `ML_SECRET` lines from the planner.

**m6. `rounds` at reset equals hostile count + 1.** `tremor.c:55`: `tr_rounds = totalkills+1` after crew are removed from `totalkills`. An agent reading `rounds` at tic 0 learns the exact number of non-crew enemies on the level. Weak, but it is exact hidden state (rubric 2c). Provide a constant budget or a bucket.

**m7. Automap legend marks activation types of any mapped line.** `agent_api.c:114` and `TR_LineMarker` mark every mapped line with a special as `D`, `S`, `T` (any other special, such as teleporters and walk-over triggers) or a key colour. A pure-vision human sees textures only. The project patches the human automap to match (`am_map.c:1139`), so it is parity with a human using the map, but it is not "what a player sees on screen". Note it in the contract.

**m8. `events` are the last five displayed messages, never cleared between steps.** `agent_api.c:30,32` reset only in `tremor_agent_reset`; `step()` returns `observe(state).events`. An old "Take these..." line or "crew" read result stays in `events` for many steps, so `StepResult.events` is not the effect of the step. Models may mis-attribute. Either clear per step or document it as a rolling log. Also, tests assert `events` contains `'crew'` right after reading, which passes either way.

**m9. Runner nits.**
- `runner.ts:245`: `else consecutive=0` also resets on a failed call, so an alternating invalid/error pattern never triggers the fallback. Minor, bounded by call/time caps.
- `runner.ts:248` `source: controller.mocked?'replay-mocked':controller.model?'model':'baseline'`: a controller that sets neither is labelled "baseline" even if it is not one.
- The controller can `import` the engine modules in-process; state isolation relies on the WeakMap-held handle never being passed to controllers. That is adequate for this evaluation, but state "no way for the controller to touch state" as "no handle is provided", not as a sandbox.
- Controller error strings (`String(e)`) go back as `feedback`; a Vertex error could include request details.
- `scripts/eval.ts`: `workingTree` is a hard-coded string, `gameVersion` and `configId` are stale literals, and results files are keyed by date only (`eval/results/${date}-results.json`), so a second run the same day overwrites the first. `git rev-parse` fails under the "dubious ownership" setup here and falls back to `unknown`.

**m10. Freelook and read/aim inconsistency.** When `tr_pitch != 0` or autoaim is off, bullets use `TR_PitchSlope()` (`p_pspr.c`/`p_map.c:1128`) but READ/STUN/PURGE use `crosshair()` with Doom's autoaim window (`tremor.c:92-96`), so a human can read a target their gun would miss, or the reverse. Agents have no pitch, so this affects human play only. Pitch is saved and `lookfly==127` centering is consistent with the ±126 mouse clamp (checked).

**m11. Tests that inflate the count.** About two thirds of the 123 tests (`sim.test.ts`, `main.test.ts`, `integration.test.ts`, `performance.test.ts` (skipped in CI), `src/sim/__tests__`, `src/levels/__tests__`) exercise the retired TS prototype (`legacy_player_interface`). Their passing says nothing about the Doom-engine submission. The hash-manifest test proves files match the manifest, not that the WASM matches `engine/` sources (the manifest does not list sources).
`tests/agent.test.ts` "determinism" covers 7 steps on one level; no long-horizon or multi-level replay and no cross-seed difference test. The baseline completion test runs only the careful baseline on E1M1/17.

**m12. Stale save/load edge.** `objective`/`objective_x,y` are not saved; after a load they are stale for up to 35 tics. Cosmetic.

## What I checked and found fine

1. **Entity/identity channel.** `label()` returns `unknown figure` for every `TR_Human` until `tr_revealed`; chaingunners are labelled the same, so type does not leak. Entities use the same 90° cone plus `P_CheckSight` as the renderer. Dead actors are excluded. `entities` expose only bearing/distance/elevation/type. Twin-world fixtures (crew vs possessed, same stun) give identical observations for one step of every action (test is real for that).
2. **Events.** Only HUD-displayed messages (`hu_stuff.c:423`, `TR_HEADLESS` only). No raw kill/AI events.
3. **`legal_actions()`** is constant; validation never consults identity, geometry, charges or inventory (`player_interface.ts:213-217`). Invalid actions burn the same 7 tics idle.
4. **Observation purity.** `observe` does not advance tics or touch gameplay RNG (`route_update` and `discover` are deterministic; tested). Outcome metrics (kills, crew killed, reads, fired_unread, final tremor numbers) are not in `observe`.
5. **Production artefact** omits fixture exports (`headless-artifacts.test.js` greps for `_tremor_agent_fixture`).
6. **Runner limits.** Step limit (`runner.ts:236`, plus C cap 1800), call limit (`calls++` before the call, failed calls consume budget and are counted as `errors`), per-call timeout via `Promise.race` + `AbortController`, whole-episode cap, `terminate()` only effective if not already terminal, natural exit/death takes precedence over a later limit. Fallback after 3 invalid decisions is a labelled `wait` (`source:'fallback'`), never counted as a model move (`modelMoves` counts valid `source==='model'` rows). Replays are labelled `replay-mocked`. Controllers receive `structuredClone`d observations and a copied legal list. All of these are asserted in `tests/agent.test.ts`.
7. **Determinism.** Gameplay randomness is P_Random (`TR_Hit`, `TR_Aim`, `TR_Think`, spawn thinning, drops, crew assignment). `M_Random` (cosmetic arm jitter, `TR_ArmY`) is on a separate index. `TR_Light` is hash-based on `leveltime`. Every `reset()` creates a fresh WASM module, so no state leaks between episodes. Same seed gives identical observations and outcomes (probe and test). `observe()` called extra times does not change the run (tested).
8. **Mechanics.** Hit chance: at terror 100 the success probability is 77/256 (30.08%) as documented, tested 70-85/256; `TR_Damage` gives +60% at terror 100 (tested 160); melee and bullet misses go through the same `TR_Hit`, and `TR_Aim` is player-only (`P_SpawnPlayerMissile`, `P_GunShot`). Rare ammo: thinning uses P_Random over the actual clip/box/shell/cell/rocket thinkers with saved `next` pointers, so removal during iteration is safe; the drop rate and the thinning rate are tested with 256/512 trials. Rounds: shared `tr_rounds`, `P_GiveAmmo` mapping 1/2/4, mercy +3, never negative, fists fallback. Terror: once per corpse via `tr_seen` (saved and loaded), directional, halves per level, decays one point per 350 tics. Radio: once per episode via `radio_bits`, 90-second cooldown with pending replay, briefing once per map, history survives `TR_ClearRadioQueue` (tested). Terminal detection: death first, then exit via `ga_completed`/non-level gamestate, step limit, and a boundary test with a real exit switch.
9. **Save/load.** `tr_seen`, `tr_death_tic`, `tr_crew`, `tr_revealed`, `tr_stun`, `tr_cower`, `tr_terror`, `tr_trauma`, `tr_rounds`, `tr_charges`, `tr_saved`, `tr_pitch`, radio history/bits/pending/log/briefing bits, `story_clock` and `radio_last` are archived, and `tests.c` round-trips the global block. Read/purge partial progress resets on load (documented).
10. **Route BFS.** The circular queue, `abs(u%w-x)>1` row-wrap guard, stale `route_clock` guard, recursion depth cap 4 and `path` bounds are sound. The `n>ROUTE_MAX` early return leaves the previous route (acceptable for Episode 1 map sizes). Cost: the full lattice BFS runs on every 7-tic step (`route_clock==leveltime/7`), and `step()` also calls `observe()` each time, so each action rebuilds the 257x257 automap JSON and the route; performance only.
11. **Build reproducibility for TS tests.** `npm ci && npm test` needs only committed artefacts (`public/engine*`, `public/wad`), `.gitattributes` forces LF on manifest-listed text, and the manifest test verifies every listed file. The shipped WASM files are newer than every C source (no stale artefact seen). No emsdk is needed for vitest.
12. **CI test kinds present** in `tests/agent.test.ts`: invariants (rounds, trauma monotonic, health bounded, crew cannot damage), legal/illegal (constant vocabulary, unknown action/player), terminal outcome (`step_limit` on E1M1, exit fixture score 100), observed regressions (named: gore decoration crash, double intro, exit boundary), hidden info (twin worlds; see M2 on coverage), episode limits (step, call, per-call and episode timeout). The kinds exist; M2 and M5 are about depth, not presence.

## Suggested priority before submission

1. Fix or revert the baseline change and get `npm test` green (M1).
2. Decide on purge and terror identity channels and make the tests exercise them (M2, M3).
3. Wire `tests.c` into something that runs on a fresh clone, or at least re-run and log it against the final source (M5).
4. Refresh the contract docs (M4); fix kill-heal clamp (m3) and the RNG use in gore (m2) if time allows.
