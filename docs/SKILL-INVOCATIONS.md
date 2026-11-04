> Earlier entries are historical session records, superseded by the later validation and live evidence linked below.

# Skill invocations

## 2026-10-31 - Codex session codex-doom12 - before changes
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

These before/after invocations belong to codex-doom12. codex-doom13 below is a separate Codex session; see docs/agent-sessions/README.md.

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

## 2026-11-02 - Codex session codex-doom18 - before changes

Invoked **tremor-level-check** by name. Read the skill, AGENTS.md, contracts, rubric, full course brief, audit and current sources. Initial working tree was clean at 2b18e48. Scope: audit items 1-17, trace reasons and a human-run demo command. No live calls or commits. Regression checks and baseline comparison pending.

## 2026-11-02 - Codex session codex-doom18 - after changes

Invoked **tremor-level-check** again by name and reread the skill. Reviewed ownership, contracts, rubric and final changes; added design rows for hint layout and trace reasons to docs/rule-source-map.md.

Failing tests first: `npx.cmd vitest run tests/hint.test.js tests/agent.test.ts` failed because hint-layout.js was missing and recorded reasons were undefined (19 existing tests passed). After implementation, `npm.cmd test` passed 64 tests in 16 files; `npm.cmd run typecheck`, `npm.cmd run build` and `npm.cmd run engine:test` passed (508 C checks, zero failures). The existing art/title.jpg build-resolution warning remains. The final patch/layout/watch checks passed, then all 64 tests passed again. The watch DOM test displays a supplied reason; historical traces remain unchanged. No C changes or rebuilds; evaluated headless engine and WAD SHA-256s match the primary report. Manifest raw-byte/LF checks pass.

Ran `npm.cmd run eval -- --players baseline_aggressive,baseline_careful --cases all`. Result: eval/results/2026-11-02-2026-11-02T18-08-28-280Z-results.json; table has the same basename. Gzip trace paths are recorded per episode in that JSON under ignored eval/traces/. Compared all 28 episodes with the 2026-10-31T06-19-01-385Z report: reason, score, metrics, steps, illegalActions, fallbacks and objectivesReached are identical. Each baseline exits 2/14, dies 10/14 and reaches the step limit 2/14. No call/time limits or illegal actions. This offline run does not replace the declared live-suite tables.

Changes: submission links and scope/citation/specification, upstream patch and freshness check, separate-session correction, review-version response, CI/version evidence, working directories and large-file provenance, prose privacy, playtest and peer templates, limitations facts, canvas-relative first-time hints, trace reason retention and optional live-demo/copy commands. The patch freshness test also works in the course folder without Tremor Git history; regeneration requires the Tremor history. The demo was not run. No paid calls, commits, invented testimony or changes to either protected review. Student AGENT-TEAM.md and the personal limitations placeholders remained untouched in that session. They were later written by the student and assembled in codex-doom24. Final commit SHA, course PR Actions URL/SHA, recording and student peer notes remain human submission steps.

## 2026-11-04 - Codex session codex-doom24 - submission audit

Invoking skill tremor-submission-audit. Read and followed [the skill](../skills/tremor-submission-audit/SKILL.md) after assembling the student account, limitations, anonymous playtests and current peer-note status. Audited the current submission tree against the supplied midterm brief, four Nov 2 audit inputs and the Nov 4 human-playtest update. Checked required artifacts and README links, rule sources and visible help, evaluation suite and limits and costs, reviews and responses, playtest structure and anonymity, licenses and credits, privacy and CI commands.

[Findings](reviews/submission-audit-2026-11-04.md) record three documentation findings fixed separately by the editor and five open findings for Claude. The audit made no gameplay or student-text edits. Session evidence covers codex-doom17 through codex-doom24. No rule changes required tremor-level-check in this session. No live trials or commits.

Validation passed with 76 tests in 19 files, typecheck, build and 508 engine checks with zero failures. The existing title-art build warning remains. All 19 marked student blocks match the original supplied prompt after paragraph whitespace normalization, with headings and evidence excluded. The required seven-document relative file-link check and changed-file privacy and LF checks passed.
