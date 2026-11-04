# Submission audit 2026-11-04

## Scope and inputs

Invoking skill tremor-submission-audit in session codex-doom24 against HEAD d803595 and the documentation assembled in this session. This is an editor self-audit using a read-only checklist. It is separate from the independent reviewer sessions already recorded.

Inputs were the student-supplied midterm brief and four Nov 2 audit files covering rubric, sources and rule map, clarity and speed, and the full brief, read from `<scratchpad>`. The instructor's Nov 4 update supplied in this task allows human notes from any player. The [skill](../../skills/tremor-submission-audit/SKILL.md) captures the reusable checks. No rules, game code, assets or student sentences were changed. No new live evaluation or browser playtest was run.

## Checked evidence

- [README](../../README.md) links the evaluation, student log, peer notes, agent sessions and review responses. Scope, reference game, course working directory, setup, tests, evaluation, large artifacts and rebuild information are present.
- [Rule map](../rule-source-map.md), [rules](../RULES.md), [contracts](../CONTRACTS.md), engine/tremor/tremor.h, engine/tremor/agent_api.c and src/eval/runner.ts provide rule locators, constants, public-observation boundaries, the constant 40-action ABI and bounded episodes. Current rule rows include inherited, design, manual, observed and assumed evidence. Title and in-game help in index.html and public/engine.html expose goal, controls and mechanics. Existing tests cover invariants and regressions. Browser performance was not measured in this audit.
- [Evaluation](../../EVALUATION.md), [declaration](../EVALUATION-PLAN.md) and committed results and traces disclose two starts per map/player, held-out cases, live and baseline comparisons, history conditions, failures, latency, tokens, dated prices, lower-bound costs and version differences. The reported suite has 56 episodes and each baseline exits 2 of 14. Both model conditions exit zero. Historical development runs remain separate.
- [Review records](./) include the Oct 30 prototype findings and ac0e32b fix, Oct 31 real-engine findings and responses including 9927bfe, the second pass and response, and Nov 2 final findings and response. [Skill invocations](../SKILL-INVOCATIONS.md) record separate codex-doom12 and codex-doom13 level-check sessions.
- [Human playtests](../playtests/README.md) record four anonymous sessions in three blocks with the three required labels. Assistant browser observations remain separate. Exact human session times, durations and deployed hashes were not recorded. Build windows use git author times and disclose that limit. [Given notes](../peer-notes/README.md) remain a Nov 16 template.
- [Third-party provenance](../../THIRD-PARTY.md), [engine upstream](../../engine/UPSTREAM.md), root LICENSE, shipped Freedoom license, art credits and radio credits retain source and asset terms. The upstream patch freshness regression passes in the required test suite. The existing Higgsfield verification record was inspected without a new legal or online terms review.
- The course workflow runs npm ci, npm test, npm run typecheck and npm run build within the course folder. tests/agent.test.ts exercises shipped engine fixtures. Local required command outcomes are recorded below. Final course PR boundaries and hosted recording access require the submission handoff.

## Findings

| ID | Severity | Status | Finding and action |
| --- | --- | --- | --- |
| D1 | Documentation | Fixed | README still described the student account as pending. It now links the present [account](../../AGENT-TEAM.md), and the limitations, playtest and peer-note status reflect the supplied text and Nov 4 update. |
| D2 | Documentation | Fixed | The [session index](../agent-sessions/README.md) lacked rows and supplied prompt/results after codex-doom18. Sessions 17 through 24 are indexed, including interrupted 20 and follow-up 20b. Missing results and temporal commit associations are explicit. The other-agent table includes research, workers, audits, reviewers, terms check and evaluated player. |
| D3 | Documentation | Fixed | Changed evidence copies contained local paths and the evaluation edit retained CRLF bytes. Local paths are redacted to `<scratchpad>` in copied evidence, README uses a portable root description, and all changed Markdown is LF. Relative file links in the seven requested documents resolve. |
| O1 | Submission | Resolved 2026-11-04 | README still has no viewable recording upload URL. [Recording metadata](../../recordings/README.md) documents the local output, which does not establish instructor access. Upload or link the actual recording and verify access. |
| O2 | Submission | Resolved 2026-11-04 | [Evaluation](../../EVALUATION.md) and [upstream provenance](../../engine/UPSTREAM.md) retain final submitted-revision and course PR Actions URL/SHA placeholders. Claude must associate the final commit and final CI evidence after the course PR exists. Local checks and the historical fork run do not establish final course CI. |
| O3 | Accuracy | Open for Claude | The fixed student paragraph says Gemini only gets game-screen information. [Contracts](../CONTRACTS.md) document public textual observations, including designed unseen-geometry guidance, with no pixels or audio. The factual limitation is already disclosed in EVALUATION.md. Review this discrepancy with the student before submission. Student text was preserved. |
| O4 | Evidence limit | Open for Claude | Student reflections describe fear causing bot misses and human testimony supporting the mechanics. The declared suite has uniformly steady final terror and cannot establish that explanation. Existing factual limitations distinguish final buckets from trajectories and human testimony from measured results. Further causal claims require evidence or a student-authorized clarification. No testimony or results were invented. |
| O5 | Gameplay | Open for Claude | The student's limitations describe an elevated enemy that becomes difficult to fight without ammunition. This session did not reproduce the situation or change spawns. Review the claim and decide whether it needs a gameplay follow-up. |

O1 resolved on 2026-11-04. The [uploaded recording](https://drive.google.com/file/d/1-gUtdHicrsxu483OgbBwNUdB4stBCUJH/view?usp=sharing) is now linked from README. The uploader reports that anyone signed in with a columbia.edu account can view it. The uploaded size was verified as 92298487 bytes, matching the local file size in [recording metadata](../../recordings/README.md). The hash was not recomputed remotely. The original finding text is retained above.

O2 resolved on 2026-11-04. All checks passed on course commit `95a2899`, synced from Tremor revision `9e06475`, in [course PR #67](https://github.com/columbia-university-ai-games/game-dev-f26/pull/67), including the [Midterm nicoh-yay verify run](https://github.com/columbia-university-ai-games/game-dev-f26/actions/runs/41889125996) and the [Minigame submission boundaries run](https://github.com/columbia-university-ai-games/game-dev-f26/actions/runs/41889126102). EVALUATION.md, README.md and engine/UPSTREAM.md now record the submitted revisions and final course CI evidence. The older fork run remains historical evidence. The original finding text is retained above.

Documentation corrections were performed separately by the authorized editor after the read-only audit. Open findings require Claude's handoff, evidence review or a later authorized change. The student text remains fixed.

## Validation

All required local commands passed. npm test passed 76 tests in 19 files, npm run typecheck passed, npm run build passed and npm run engine:test passed 508 checks with zero failures. Build retains the existing art/title.jpg resolution warning.

The verbatim comparison uses all 19 marked student blocks from the original supplied codex-doom24 prompt. It ignores heading and evidence lines and normalizes paragraph whitespace only. All 19 blocks match. The separate authorship notice also matches. Link, privacy and LF scans cover the final changed documentation and are logged in the session result.
