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
`game-dev-f26/midterms/nicoh-yay/` also passed npm ci,43 tests,typecheck,build and
508 C checks. Initial temp-alias cwd access and default global npm cache were
blocked by filesystem permissions; using the writable tools-root copy and project
.npmrc cache fixed the reproducibility check without elevated permissions.

Results: EVALUATION.md links exact date+run-ID JSON, controller/config/artifact
hashes and three sample gzipped traces with SHA-256 manifest. Both scripted players
exit 2/14, die 10/14, hit step limit 2/14; zero illegal actions, calls/time limits0.
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
Final root and copied-folder checks:43 active tests/9files,508 C checks, typecheck
and build passed. Evaluation command returned exit code0. Artifact/controller
hashes and all3sample gzip hashes rechecked against final working files.
