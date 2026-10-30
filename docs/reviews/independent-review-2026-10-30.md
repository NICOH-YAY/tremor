# Independent review of Tremor, 2026-10-30

Reviewer: a fresh read-only Claude Sonnet session. I did not write this code and was given no instruction to approve it. I changed no source, test or config file. The only file I created is this review.
Scope: docs (RUBRIC-CHECKLIST, DESIGN, DECISIONS, EVALUATION-PLAN, rule-source-map, CONTRACTS), README, `src/player_interface.ts`, `src/eval/*`, `src/agent/*`, `src/sim/*`, `src/levels/*`, `tests/*`, `scripts/eval.ts`, and the workflows. Commit reviewed: `14180b8` (main).
Commands run: `npm.cmd test` gave 10 files and 98 tests, all passing. `npm.cmd run typecheck` was clean. I also ran one throwaway probe script from my scratchpad, outside the repo, to confirm the leak in B1.

Verdict: the information boundary is not closed yet. There is one blocker (a hidden-identity oracle that the leakage test does not cover) and four majors. The runner limits and determinism are solid.

## Findings, ranked

### BLOCKER

**B1. Crew-vs-Possessed identity leaks through `stun` events and `purge` validation feedback, with no read.**

Confirmed by probe. One figure at 1.2 tiles, unread, run through `step(stun)` then `step(purge)`:
- possessed: stun valid, `observe().events` contains `{"type":"stun"}`, and purge returns `valid:true`.
- crew: stun valid, events are `[]`, and purge returns `valid:false, reason:"purge unavailable: requires a nearby stunned target and charge"`.

Causes:
- `src/sim/rules/mercy.ts:51-54`: the `stun` event is pushed only if `e.kind==='possessed'`. `src/player_interface.ts:33` forwards the event type to the player.
- `src/player_interface.ts:49`: the purge validity check reads `aimed.kind!=='possessed'` and `aimed.state!=='stunned'`, which is hidden state. The `reason` string goes back to the model as `feedback` (`src/eval/runner.ts:19`, `src/agent/model_player.ts:113`).

Impact:
- This defeats Recognition for any model that tries stun on unknown figures. README and DESIGN present reading as the way to learn identity.
- It contradicts RUBRIC-CHECKLIST ("legal_actions must NOT leak secrets (e.g. purge must not become legal only when a target is secretly Possessed)"). The DECISIONS bullet "Constant legal list... stun/purge never reveal hidden identity" is true only of `legal_actions()`. The feedback channel and the event channel re-introduce the leak.

Fix: make stun and purge feedback identity-neutral (a generic "no effect" that does not say why), and either drop `stun` from the sanitized events or emit it for any aimed target. Add the test described in M1.

### MAJOR

**M1. The hidden-information leakage test is too narrow to catch B1.**
`tests/agent.test.ts:16` compares `observe()` and `legal_actions()` only, for one static pair of possessed and crew. It never calls `step`, so it does not exercise the `stun` event, the purge feedback, or events after any action. The observed regression at `tests/agent.test.ts:15` only checks that raw `kill` text is absent.
Fix: run the same action script (stun, purge, fire, read) on twin worlds that differ only in hidden kind, and assert that `step().valid`, `step().reason`, and the following `observe()` are identical until a legitimate reveal.

**M2. Baselines and the model player do not see the same observation.**
- Baselines receive the structured `Observation` and use `o.pose.x`, `o.pose.y`, `o.pose.angle` and `o.tic` (`src/agent/baselines.ts:34, 64, 69, 96`) for BFS navigation, aiming and door-use cadence.
- The model receives only `o.summary` (`src/agent/model_player.ts:113`). `summary` (`src/player_interface.ts:36`) has health, ammo, keys, aim, figures, events and the automap, but not pose, heading or tic.
- The model sees `@` on the map but not which way it faces, so it cannot link the map to its turns. The baseline can.
- This contradicts the checklist rule "Same observations and actions for both" and the README line "Model players see observations and legal IDs only." The model-vs-baseline comparison is confounded, and the model is handicapped.
Fix: add pose, heading in degrees and tic to `summary`, or give the model the identical structured JSON.

**M3. The required CI workflow file does not exist.**
RUBRIC-CHECKLIST specifies `.github/workflows/midterm-nicoh-yay.yml`. The repo has `ci.yml` and `pages.yml`. `ci.yml` runs `npm test` and `npm run typecheck` on every push and PR. If the submission PR needs the single named workflow limited to `midterms/nicoh-yay/`, it still has to be created (with `working-directory` and path filters). I could not see the submission layout, so this is likely a submission-time gap.

**M4. EVALUATION-PLAN.md has a stale "Implementation verification" section that contradicts the repo.**
It says "npm test: 15 tests passed", "this branch registers only test_room", and "Full suite execution awaits content-worker levels". Today there are 98 tests and 8 registered levels (`src/levels/index.ts`). A grader reading it will think the suite never ran.

### MINOR

- **m1. Unseen-activity events leak existence, not identity.** `observe` forwards the type of the last 5 log events (`src/player_interface.ts:33`) with no line-of-sight filter: `alert`, `fireball`, `explosion`, `collarBreak`, `kill`, `door`, `cured`. `collarBreak` implies a collared hound exists, `fireball` implies an ember, and so on. Ids and positions are stripped, but the type alone discloses hidden activity. Either document it as intended audio-like information or filter by visibility.
- **m2. Post-kill side effects distinguish human from demon.** Crew and Possessed kills heal 15 and demon kills heal 10 (`src/sim/rules/temptation.ts`), and only crew or Possessed kills raise tremor. The health delta and the `aim` bucket show up in the next observation. This matches the design ("the body carries it") and does not separate crew from Possessed, so I note it only for completeness.
- **m3. DECISIONS says "Supplies, keys, radio and recent event types are observable", but supplies are not.** `observe` filters `kind!=='pickup'` out of `entities` (`src/player_interface.ts:26`) and marks only keys on the automap (`:30`). Medkits, ammo and purge charges are invisible until walked over, and then only a `pickup` event follows. Add them to the observation or fix the text.
- **m4. `illegalActions` conflates transport/parse errors with illegal moves.** In `src/eval/runner.ts:20`, any call that throws (HTTP error, bad JSON giving `action:''`) increments `invalid` and counts toward the 3-consecutive-invalid fallback. EVALUATION-PLAN promises illegal actions as a metric. Add a separate `errors` counter.
- **m5. Token usage is lost for failed or timed-out calls.** Tokens are counted only when a decision returned (`src/eval/runner.ts:16`). The call budget does count them. Cost is reported as null, so this is a reporting caveat only.
- **m6. No episode wall-clock cap.** The per-call timeout is 20 s and the call cap is 400, so the worst case is about 2.2 hours per episode if the API hangs just under 20 s. A timeout ends the episode (good), but repeated fast failures have no backoff. Consider a total-time limit.
- **m7. Stun range mismatch between validation and rule.** `src/player_interface.ts:50` rejects stun beyond 2 tiles, while `MERCY.STUN_RANGE` is 2.5 (`src/sim/rules/mercy.ts:6`) and DESIGN says 2.5. A legal 2.0 to 2.5 stun is rejected and costs an idle step.
- **m8. A repeated `purge` is rejected once the last charge is spent.** The charge is deducted when the purge starts (`mercy.ts:61`) and the cure lands 35 tics later. A second `purge` step with 0 charges left is invalid (`player_interface.ts:49`) and counts toward the 3-invalid fallback, so a model that repeats `purge` mid-purge is penalised instead of the call being a no-op.
- **m9. The baseline test asserts only the careful baseline.** `tests/baseline.test.ts:44` filters `baseline_careful` before `.every(reachedExit)`. README ("checks completion on both seeds across all seven levels") and DECISIONS ("Both baselines finish all seven cases") are true per `eval/integration-baselines.json` (aggressive reaches the exit in all 14 runs), but the aggressive result is not CI-enforced.
- **m10. Seeds barely vary baseline outcomes.** Many baseline rows are identical across seeds 17 and 83 (s1 68/68 steps, h1 74/74, h2 44/44 in `eval/integration-baselines.json`). "Two trials each" is effectively one for most baseline cases. Say so in EVALUATION.md.
- **m11. The "rule invariants" test in `tests/agent.test.ts:7` is nearly vacuous for tremor.** It only changes if the shots kill crew in `test_room`. Real monotonic, crew-only coverage lives in `src/sim/__tests__/mechanics.test.ts:53-76` and is adequate.
- **m12. Doc/code drift.** DESIGN "Agent" lists `move_forward` and `read_target`; the real ids are `forward` and `read` (`src/player_interface.ts:6`). DESIGN says the "wounded survivor holds the blue keycard", but the key is a floor item at (4,17) (`src/levels/quarantine.ts:79`, comment on line 80 says "the key lies beside them").

### NIT

- `step` calls `observe(state)` every tic (`src/player_interface.ts:54`) to update the fog memory, rescanning the map 7 times per step. It is only a performance matter, but it makes seen-cell memory finer-grained than the decision points, which is undocumented.
- Entity ids are spawn order (`createWorld`, `id: i + 1`) and appear in `Figures`. Anyone with the level source can map id to kind, though a player without the repo cannot.
- `tests/performance.test.ts` uses a 6 ms threshold that may flake on slow CI runners. The docs already say it is not a browser guarantee.
- Rule-source-map row "Enemy health / movement / pain probabilities" is labelled `code` while saying spawn health defaults to 40, not Doom's. Under the map's own definition this is allowed, but the number could be labelled `design`.
- `.npm-cache`, `dist` and `node_modules` are correctly git-ignored.

## What I checked, with evidence

### 1. Information boundary
- `observe()` (`src/player_interface.ts:13-38`) filters entities to alive, non-pickup, non-fireball figures that pass line of sight and the 120 degree FOV (`:26`). `kind` is `'unknown figure'` unless `e.revealed`, and `state` is hidden unless revealed. `readProgress`, `data`, `alerted`, `collar` and `health` are not output. Twin possessed and crew worlds give identical observations (`tests/agent.test.ts:16`).
- Events (`:33`) are reduced to `{type}`, plus `text` for radio and `name` for pickup. `kill.kind`, `wasCrew`, ids and `noise.pos` are removed (regression test `tests/agent.test.ts:15`). The residual leaks are the stun event and purge feedback (B1) and event-type existence (m1).
- `legal_actions()` is constant (`:40`), tested at `tests/agent.test.ts:8, 16`.
- The model player (`src/agent/model_player.ts:113`) receives only the RULES text, the legal id list, its own bounded history of prior summaries and actions, `o.summary`, and the feedback string. No world fields, no `outcome()`, no shell or repo tools. The runner passes `structuredClone(observation)` (`runner.ts:15`) and keeps the World. `StepResult.state` is not forwarded to the controller; only `result.reason` is.
- Gaps found: B1, M2, m1, m3.

### 2. Runner limits
- Step limit: `runner.ts:12`, tested at `tests/agent.test.ts:18`. Call limit: `:12` with `calls++` at `:14`, tested with a throwing controller (`modelCalls` is 2). Failed calls count toward the budget.
- Timeout: `Promise.race` with a timer and `AbortController` (`:15`), then explicit `terminate(world,'timeout')` (`:17`). Tested at `tests/agent.test.ts:20`.
- Terminal reasons are explicit: `exit`, `dead`, `step_limit`, `call_limit`, `timeout` (`player_interface.ts:8, 58`). A terminal `step()` does not advance the sim (`:47, :53`).
- Fallback: after 3 consecutive invalid decisions a `wait` is stepped with `source:'fallback'` (`:24`). `modelMoves` counts only `source==='model' && valid` (`:26`), so fallbacks are never model moves. Tested at `tests/agent.test.ts:19`. Replay is labelled `replay-mocked` (`:23`).
- Gaps: m4, m5, m6.

### 3. Rule correctness vs DESIGN
- Recognition: 35 progress units, range 10, a close bonus, decay 0.25 (`rules/recognition.ts`). Reveal persists. Tests at `mechanics.test.ts:26-50`. DESIGN's "~1 s" holds at rate 1.0; the actual rate is 0.5 to 1.5.
- Trauma: only increases (nothing decrements `tremor`), capped at 6, crew and Possessed only, demons add none (`rules/trauma.ts`). Tests at `mechanics.test.ts:53-67`. Retry resets by design in `src/main.ts`, and the main test covers the carry-over.
- Temptation: crew 15, demon 10, cap 100, fireball and pickup excluded (`rules/temptation.ts`, test `mechanics.test.ts:68`).
- Mercy: stun range 2.5, 70 tics, 20-tic cooldown. Purge range 1.5, 35 tics, charge spent on start, interrupted by damage or range with no refund. Cure gives a 50% helper chance and a seeded 15% relapse at 600 tics (`rules/mercy.ts`, tests `:78-150`). Only m7 and m8 differ.
- Noise: flood fill through unblocked cells within 12 tiles, closed doors block (`rules/noise.ts`, test `:151`).
- Determinism: the PRNG is `worldRng` over `world.rngState`. No `Math.random` or `Date.now` in `src/sim`, `src/agent` or `src/player_interface.ts`. `Date.now`, `crypto.randomUUID` and `performance.now` appear only in the runner for trace names and latency. Tested at `tests/sim.test.ts` (identical replay) and `mechanics.test.ts:319`.
- Health bound: `world.ts:177` clamps, regression test `tests/integration.test.ts:54`.

### 4. Baselines
- Both are BFS explorers over the observed automap: key first, then exit, then frontier (`baselines.ts:33-72`). They engage figures within 4 tiles with bounded attempts (45) and recover from blocked strafes. The careful one reads before firing and tries stun and purge on revealed Possessed. They are not random. All 14 runs per baseline reach the exit (`eval/integration-baselines.json`); careful always reads, aggressive never does.
- They use only `Observation` fields, never `World`. The door heuristic is openly suite-specific. The observation mismatch with the model is M2.

### 5. CI coverage of the five kinds
- Rule invariants: `mechanics.test.ts`, plus `tests/agent.test.ts:7`.
- Legal and illegal actions: `tests/agent.test.ts:8`, `tests/sim.test.ts:229`.
- Terminal outcome: `tests/agent.test.ts:9`, `tests/baseline.test.ts`.
- Observed regressions: `tests/agent.test.ts:15` (kill event leak) and `tests/integration.test.ts:54` (health -2).
- Episode limits: `tests/agent.test.ts:18-20`.
- Leakage test: `tests/agent.test.ts:16`, present but weak (M1).
- The workflow runs `npm test` and `npm run typecheck`. The required file name is missing (M3).

### 6. Rule/source map
- I read all rows of `docs/rule-source-map.md`. Each has a label (code, design or observed) and a locator. No `manual` or `assumed` rows are used, and the file says so. Locators are file/function level.
- Code-labelled rows cite `docs/research/doom-rules.md` and linuxdoom file/function names. I did not verify these against upstream (no network access in this review), so treat the `code` labels as asserted, not checked.
- Implemented behaviour with no row: the stun-validation range (m7) and the `aim` bucket thresholds (steady below 0.5, shaky below 2). Both minor.

### 7. Bugs, dead ends, unsupported claims
- Levels: `src/levels/__tests__/levels.test.ts:65` checks that the exit is reachable and each key precedes its door. I read the Hangar and Quarantine layouts and found no dead end. Keys sit before their doors, the closet door is released by the red key, B-2 is optional and toggles, and the blue door is reachable. The five situations are small and both baselines complete them.
- Unsupported or stale claims: M4, m3, m9, m12. The README statement "No live results are claimed" is supported: no live run exists, and `scripts/eval.ts:16` skips model players without `--live`.
- Not verified: the live Vertex path (never run), browser pointer lock, audio and rendering (the main test mocks canvas), the 60 FPS browser claim, and the Higgsfield art terms.
