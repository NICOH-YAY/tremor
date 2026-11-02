# Independent final review - Tremor at f7dc038 (2026-11-02)

Reviewer: independent, read-only Claude session. I did not write this code and had no instruction to approve it.
Scope: commit `f7dc038` (changes since `9927bfe`: 8f0e4a9, 13856cb, c042ec0, 2b18e48, f7dc038) plus a fresh pass against the midterm brief. Uncommitted files under `eval/demo/` and `public/replays/` (a live demo run in progress) were ignored, except where they exposed a defect (F1).

## Method

- `git log/diff 9927bfe..f7dc038`; read the full diff of `src/`, `engine/platform/doomgeneric_headless.c`, `engine/build/headless.py`, `public/{engine-page,horror,music,watch}.js`, `watch.html`, `scripts/{demo-live,copy-demo,upstream-patch,eval}`, and the new tests.
- Recomputed from the primary results JSON (`eval/results/2026-10-31-...06-19-01-385Z-results.json`): exits, deaths, timeouts, errors, illegal, tokens, cost, unknown-usage, call timeouts. Recomputed sha256 of the five trace samples, the three served replays, the four evaluated engine/WAD artifacts, the two watch-engine artifacts, and the upstream patch (regenerated from `git diff 821957f`).
- Compared recorded `controllerSources` hashes with current files; compared README/EVALUATION claims with `docs/agent-sessions`, `docs/SKILL-INVOCATIONS.md`, and the GitHub Actions run via `gh api`.
- Link-checked README.md, EVALUATION.md, RECORDING-GUIDE, peer-notes and playtests READMEs.
- Ran `npx vitest run` once and `tsc --noEmit` once (Node D:\node.exe).

## Test results

- `tsc --noEmit`: exit 0, no errors.
- `vitest run`: 16 files, 65 tests: 64 pass, 1 fail. The failure is `tests/watch-replay.test.ts` "model-history" for the *uncommitted* `demo-model-history-E1M1-17` manifest entry (ENOENT `eval/traces-sample/demo-model-history-E1M1-17.jsonl.gz`). The committed manifest has 3 entries, so I infer 64 tests / 64 pass at f7dc038 (consistent with codex-doom18's "64 tests in 16 files"); I did not run a clean checkout. This failure is itself finding F1.

## Findings

### Blocker

None found.

### Major

**F1. `npm run demo:copy` (the documented human step) turns the suite and CI red.**
Evidence: `tests/watch-replay.test.ts:8-12` iterates every entry of `public/replays/manifest.json`, requires `eval/traces-sample/<file>` to be byte-identical (line 12), and reads `sample.report` (line 24 region). `scripts/copy-demo.mjs:4-6` appends an entry that has no `report` field and whose trace lives in `eval/demo/`, never `eval/traces-sample/`. I observed exactly this failure in the working tree. The README (`## Optional live demo`) and `eval/demo/README.md` instruct the student to run `demo:copy`; doing so before pushing makes the course-workflow `npm test` fail on the final commit, which is also the commit graded.
Fix (pick one): in the test, skip or special-case entries with `label` starting `demo` and instead verify only sha256 + replay terminal against `sample.terminal` (the demo's own run record); or have `copy-demo.mjs` also copy the gzip into `eval/traces-sample/` and write a `report` path to a committed demo result JSON. Add a test run after `demo:copy` before the final push. Also keep `public/replays/manifest.json` entries without `report` from crashing `watch.js` (it does not read `report`, so only the test needs fixing).

### Minor

**F2. Watch page live-baseline mode does not enforce the stated 600-action limit.**
`public/watch.js` `advance()` (controller branch) increments `steps` with no `steps>=600` check; `tick()` only stops at the 5:00 wall clock (`clock+=elapsed`, not speed-scaled). At 1x, 200 ms/action allows ~1500 actions, so the panel can read "Step 750 / 600" and the `reasons.step_limit` text is never reachable live. The page claims the 600/600 budget. Fix: in the controller branch, after stepping, `if(steps>=600){engine._tremor_agent_terminate(3);finish();}`. Also scale `clock` by speed or label it as real time.

**F3. Replay determinism check is strong on metrics but tautological on the terminal reason for limit endings.**
`tests/watch-replay.test.ts` calls `terminate(...)`/`_tremor_agent_terminate(code)` using `sample.terminal.reason` before comparing the reason, so for the two timeout replays the reason match is injected, not reproduced. What is genuinely reproduced (and checked in both headless and browser spectator) is tic count, final health and all other metrics, which is meaningful: it proves the action stream replays to identical state. The docs (EVALUATION "Spectator replay verification", README, RECORDING-GUIDE) say "terminal status/reason/score and every metric" match; add one sentence that for step/call/timeout endings the reason is applied from the record and the metrics are what is independently reproduced.

**F4. Stale or inverted evidence statements.**
- EVALUATION.md "Spectator replay verification": "Current validation: 61 tests". Actual at f7dc038 is 64 (codex-doom18 records 64). Update.
- EVALUATION.md "Changes since evaluation... prompt, action interface and simulation have not changed". Behaviorally true (I confirmed `model_player.ts`, `model_rules.ts`, `prompt.ts`, `model_config.ts`, `baselines.ts` hash-identical to the recorded `controllerSources`), but two of the seven recorded source hashes now differ: `src/player_interface.ts` (action list moved to `src/agent/actions.ts`, re-exported) and `src/eval/runner.ts` (adds the trace `reason` field only). A TA comparing hashes will see this unexplained. State it explicitly; `git diff 8f0e4a9 f7dc038 -- src` is 12 lines.
- README links `review.md` as the first independent review and `independent-review-2026-10-31.md` as the second; the repo history and `docs/agent-sessions/README.md` say the reverse (review.md = "second pass", commit 203810d). It also links only `review-response-2026-10-31.md`, not `review-response.md` (the response to review.md). Fix order and add the second response link.
- `docs/SKILL-INVOCATIONS.md` first heading reads "codex-doom 12" (space) vs "codex-doom12" elsewhere; cosmetic.

**F5. Public-facing process text in README.**
"Final submission commit: to be filled by Claude after committing; Codex cannot commit" and "pending student authorship"/"Codex does not invent personal testimony" read as internal notes. Placeholders for student-only items are allowed, but reword the commit line to a neutral "to be filled at submission". Typo: "...per step. the page labels that gap" (README, Watch the agent paragraph). The project description paragraph ("The project uses the GPL Doom engine...") duplicates the Specification section.

**F6. Not every README command states its working directory.**
Fenced blocks all carry `# cwd: midterms/nicoh-yay` (good), but inline commands do not: `npm run eval -- --players baseline_aggressive,baseline_careful --cases all`, `npm run eval:live -- --players ...`, and "Run `npm test` from the project root" in the watch paragraph. The brief says to state the directory for every command; these rely on a general sentence earlier. Move them into cwd-labelled blocks. Also "Every command below uses `midterms/nicoh-yay` in the course checkout" is confusingly worded.

**F7. Baseline replay/sample provenance is a dirty-tree run.**
`public/replays/baseline-success` and the three `eval/traces-sample/baseline-*` files come from run `06-16-26-402Z` (revision 203810d, `workingTree: dirty`, model null), not the clean 8f0e4a9 run. EVALUATION says they are from "the older baseline run" but not that it was dirty. codex-doom18 showed all 28 scripted episodes identical to the clean run's, so the data are sound; just disclose the dirty stamp (or swap in the same-case traces from the clean run if its raw traces still exist in ignored `eval/traces/`).

**F8. Minor watch/UI nits.**
`public/watch.js` `show()`: `row.reason ?? '...Not retained...'` shows a blank panel for an empty-string reason (new traces); use `row.reason||`. Model traces now carry `reason`, but no test asserts the model prompt never contains a prior reason (see "verified fine"; add one regression to `tests/model-player.test.ts` to lock it in).

**F9. CI evidence is for an older commit and has a confusing run title.**
Run 41244931991 is real, in `NICOH-YAY/game-dev-f26`, workflow "Midterm nicoh-yay", success, `workflow_dispatch`, head `112c7a3` whose message is "Midterm: sync Tremor @c042ec0". So the README claim (c042ec0) is true, but its display title is the branch's stale "Trial by Combat", and it predates the watch page, replays, and the 64-test suite. Both docs already say final-version CI is pending; make sure the final PR run is recorded.

## Verified fine

1. Hidden information. `reason` is written to the trace only (`runner.ts` record) and is not returned as validation feedback (test `agent.test.ts:50-54`); `model_player.ts` history stores `{o:structuredClone(o),action}` only, so a model's own reason is never fed back. The prompt is built from observation, legal list and feedback strings. Reasons are rendered with `textContent` (no HTML injection). The watch module exports only `_tremor_agent_{reset,step,observe,outcome,terminate}` plus `_tremor_watch_frame` (no `*_test_*` fixture exports); the live-baseline path receives `structuredClone` of the public observation and `ACTION_IDS`; no key/mouse listeners exist (`watch-page.test.js` dispatches key and mouse events and asserts no state change). The spectator wasm exposes HEAPU8 but is a presentation tool, not an agent surface.
2. Headless agent ABI unchanged. `ACTION_IDS` (40 entries) and `STEP_TICS` are byte-identical, only moved to `src/agent/actions.ts` and re-exported; `doomgeneric_headless.c` additions are fully under `#ifdef TR_WATCH`; the headless export list changes only under `--watch`. `public/engine-headless/doom.cjs/.wasm` hashes equal the evaluated ones.
3. Startup freeze. Engine-page `updateMusic` no longer queries `_tremor_pressure`; `horror.js` caches `lastPressure`, sampled only inside `frame()`, so `settings.apply()`/`horror.music()` before level init are safe. `tests/start-flow.test.js` + `start-flow-smoke.mjs` run the real engine `callMain` in a killable child (10 s timeout) for layered/horror/original, assert callMain, intro, three audio callbacks (finite samples) and frames; all three passed.
4. Layered music: `musicMix` and `createOPLStream` have unit tests (continuity across blocks, style isolation, volume on both layers); settings migration is versioned and tested.
5. Watch-page determinism: a real test exists (`tests/watch-replay.test.ts`), verifying gzip sha256 against the manifest, byte equality with `eval/traces-sample`, then replay in both the headless interface and the browser spectator module and comparison of both against the report's terminal record (subject to F3). `watch-page.test.js` exercises the real page logic end to end (tic 1603, health 100, "Replay verified").
6. Upstream patch freshness: regenerating `git diff 821957f -- engine/doomgeneric` (LF-normalized) gives sha256 `b7a1fc5e...e1cd`, equal to `engine/tremor-vs-upstream.json`; `tests/upstream-patch.test.js` passed and works without Tremor git history.
7. `demo:live` is outside the suite: not in vitest, requires `--live`, label "demo, not part of the declared suite" is hard-coded in `demo-live.ts` and checked by `copy-demo.mjs`, README and CONTRACTS say it is excluded from EVALUATION tables (but see F1).
8. Evidence numbers. Recomputed from the primary JSON: baselines 2/14 exits, 10 deaths, 2 step limits each (exits only E1M1 seeds 17 and 83, matching "completion only on E1M1"); history 0 exits, 6 deaths, 8 timeouts, 20 errors, 3 illegal, 3675 calls, 14,421,537/119,947 tokens, $4.626329, 12 unknown-usage; obs-only 0 exits, 7 deaths, 7 timeouts, 11 errors, 0 illegal, 3227 calls, 10,136,269/119,304 tokens, $3.339141, 8 unknown-usage; call timeouts 0 for all 28 model episodes. All match EVALUATION.md and README. configId, revision 8f0e4a9, `workingTree: clean`, model and pricing date match. No fabricated numbers found.
9. Hashes. sha256sum of the five sample traces and three served replays equals the manifests and EVALUATION (e.g. history `d8ef5acf...1c0d`, obs-only `04dd9861...9847`); doom.cjs/doom.wasm/freedoom1.wad/tremor.wad equal both the primary JSON and the EVALUATION table; watch doom.js/doom.wasm equal `artifacts.json`.
10. Agent-team evidence. `skills/tremor-level-check/SKILL.md` exists; SKILL-INVOCATIONS records invocation by name in three distinct sessions (codex-doom12, codex-doom13, codex-doom18), with codex-doom13 explicitly a separate session. The sessions index lists 22 rollouts (21 for Oct 30-31 plus 11-02), consistent with its text, and honestly discloses shared commits, the duplicated doom6 launch, and missing results. Two independent review files exist with responses. The doc that says "no AGENT-TEAM.md has been generated" is accurate: AGENT-TEAM.md is absent, and README labels it student-pending.
11. README links: all relative links resolve except `AGENT-TEAM.md` (allowed placeholder). Recording, peer notes, limitations, final CI run and final commit are clearly marked placeholders, with the student-voice limitations TODO in EVALUATION.md.
12. Course workflow `midterm-nicoh-yay.yml` runs from `midterms/nicoh-yay`, only npm ci/test/typecheck/build, no secrets.

## Bottom line

No blockers. The one real risk is F1: the documented demo step breaks `npm test`; fix the test/script before the human runs `demo:copy`, then rerun the suite. F2 and the documentation corrections (F3-F7) are quick edits. Evidence integrity is good: all spot-checked numbers and hashes reproduce.
