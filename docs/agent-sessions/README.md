# Codex session evidence

This is a factual evidence index, not the student-authored agent team log. Link this file and [AGENTS.md](../../AGENTS.md) from the submission PR. The 21 local rollouts dated October 30-31 were indexed from session metadata and the initial user prompt only. Raw rollout JSONL contains local machine details: it is retained locally and available on request, and is not copied into this repository. Timestamps below are UTC from metadata (filenames use local time). Working directories are historical facts.

Existing completion records are retained. Added prompt/result markdown is copied from the supplied scratchpad with absolute local paths replaced by `<scratchpad>` and secret redaction if necessary. A credential-pattern scan found no secrets. Missing result files are identified explicitly. Commit associations use the first subsequent matching `git log` author time and purpose; they are temporal evidence, not proof that Codex authored or committed a commit. Claude commits. Purpose matching excludes unrelated art commits that occurred during agent work. Shared commits and interrupted/repeated sessions are disclosed.

| Date/time UTC | Session id | Working directory | Purpose | Prompt | Result | Resulting commit (time association) |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-30T06:42:22.950Z | `01a18b8b-901e-7720-9f78-c9f3c0e645ec` | `the Tremor repository root` | Initial Tremor scaffold | [codex-tremor1.md](codex-tremor1.md) | [codex-tremor1-result.md](codex-tremor1-result.md) | [747ae7c](https://github.com/NICOH-YAY/tremor/commit/747ae7c) |
| 2026-10-30T06:51:03.548Z | `01a18b93-857c-7163-a927-d154c83638a9` | `the Tremor repository root-wt\agent` | Course interface, agents, runner | [codex-tremor-agent.md](codex-tremor-agent.md) | [codex-tremor-agent-result.md](codex-tremor-agent-result.md) | [645f597](https://github.com/NICOH-YAY/tremor/commit/645f597) |
| 2026-10-30T06:59:47.312Z | `01a18b9b-83b0-7301-b7b4-30308408d9f8` | `the Tremor repository root` | Integrate renderer/mechanics/content/agent work | [codex-tremor-integrate.md](codex-tremor-integrate.md) | [codex-tremor-integrate-result.md](codex-tremor-integrate-result.md) | [9a17e08](https://github.com/NICOH-YAY/tremor/commit/9a17e08) |
| 2026-10-30T07:20:47.489Z | `01a18bae-bbe8-70a3-94b8-2f6b9dcf5a50` | `the Tremor repository root` | Presentation polish after browser playtest | [codex-tremor-polish.md](codex-tremor-polish.md) | [codex-tremor-polish-result.md](codex-tremor-polish-result.md) | [14180b8](https://github.com/NICOH-YAY/tremor/commit/14180b8) |
| 2026-10-30T07:28:43.411Z | `01a18bb5-ff4a-7853-90e8-080527f403c1` | `the Tremor repository root` | Independent-review fixes and CI | [codex-tremor-fix1.md](codex-tremor-fix1.md) | [codex-tremor-fix1-result.md](codex-tremor-fix1-result.md) | [ac0e32b](https://github.com/NICOH-YAY/tremor/commit/ac0e32b) |
| 2026-10-30T14:54:57.815Z | `01a18d4e-86c0-7eb3-8033-8ee09174c293` | `a former engine worktree` | Vendor doomgeneric and port browser engine | [codex-doom1.md](codex-doom1.md) | [codex-doom1-result.md](codex-doom1-result.md) | [4afe400](https://github.com/NICOH-YAY/tremor/commit/4afe400) |
| 2026-10-30T15:02:30.962Z | `01a18d55-76a1-7422-9c70-c6b7ffadd2f8` | `a former engine worktree` | Implement Tremor mod in Doom | [codex-doom2.md](codex-doom2.md) | [codex-doom2-result.md](codex-doom2-result.md) | [9bba987](https://github.com/NICOH-YAY/tremor/commit/9bba987) |
| 2026-10-30T15:21:05.402Z | `01a18d66-780e-7493-8028-28972a1e0cfa` | `a former engine worktree` | Settings, audio and persistent saves | [codex-doom3.md](codex-doom3.md) | [codex-doom3-result.md](codex-doom3-result.md) | [7537cb9](https://github.com/NICOH-YAY/tremor/commit/7537cb9) |
| 2026-10-30T15:36:23.217Z | `01a18d74-7953-7e90-9871-67752994089f` | `a former engine worktree` | Browser start fixes and real-engine agent adapter | [codex-doom4b.md](codex-doom4b.md) | [codex-doom4-result.md](codex-doom4-result.md) (shared task; prompt superseded doom4) | [ac7be97](https://github.com/NICOH-YAY/tremor/commit/ac7be97) |
| 2026-10-30T16:05:16.624Z | `01a18d8e-ea64-7ba2-814e-c8796be06a3d` | `the Tremor repository root` | Cross-OS artifact hashes | [codex-doom5.md](codex-doom5.md) | [codex-doom5-result.md](codex-doom5-result.md) | [8525b5d](https://github.com/NICOH-YAY/tremor/commit/8525b5d) |
| 2026-10-30T23:02:26.909Z | `01a18f0c-d6ca-7052-a630-e56625372beb` | `the Tremor repository root` | Horror presentation pass | [codex-doom6.md](codex-doom6.md) | [codex-doom6-result.md](codex-doom6-result.md) | [27f662b](https://github.com/NICOH-YAY/tremor/commit/27f662b) (same prompt launched twice; contribution split unverified) |
| 2026-10-30T23:03:30.558Z | `01a18f0d-d3cd-7720-bde3-41de9c61bca1` | `the Tremor repository root` | Horror presentation pass | [codex-doom6.md](codex-doom6.md) | [codex-doom6-result.md](codex-doom6-result.md) | [27f662b](https://github.com/NICOH-YAY/tremor/commit/27f662b) (same prompt launched twice; contribution split unverified) |
| 2026-10-30T23:27:33.477Z | `01a18f23-d5d7-7ee1-aea5-28e8f706d47b` | `the Tremor repository root` | Lighting, subtitle, interpolation, navigation | [codex-doom8.md](codex-doom8.md) | [codex-doom8-result.md](codex-doom8-result.md) | [d608349](https://github.com/NICOH-YAY/tremor/commit/d608349) |
| 2026-10-31T01:01:28.661Z | `01a18f79-d247-7e90-a2e7-152a3f116521` | `the Tremor repository root` | Baseline navigation and completion | [codex-doom9.md](codex-doom9.md) | [codex-doom9-result.md](codex-doom9-result.md) | [93f5646](https://github.com/NICOH-YAY/tremor/commit/93f5646) (shared commit) |
| 2026-10-31T01:29:28.763Z | `01a18f93-7789-79d2-89b9-79dd3899079e` | `the Tremor repository root` | LF normalization of manifest-listed text | [codex-doom10.md](codex-doom10.md) | [codex-doom10-result.md](codex-doom10-result.md) | [93f5646](https://github.com/NICOH-YAY/tremor/commit/93f5646) (shared commit) |
| 2026-10-31T05:12:57.244Z | `01a19060-0be0-7092-9381-bcfea4df87db` | `the Tremor repository root` | Baseline retreat/recovery and supplies | [codex-doom11.md](codex-doom11.md) | [codex-doom11-result.md](codex-doom11-result.md) | [c6316ff](https://github.com/NICOH-YAY/tremor/commit/c6316ff) |
| 2026-10-31T05:24:08.599Z | `01a1906a-4ee6-7ca3-927b-d19c1592e097` | `the Tremor repository root` | Audit/review/playtest response | [codex-doom12.md](codex-doom12.md) | [codex-doom12-result.md](codex-doom12-result.md) | [9927bfe](https://github.com/NICOH-YAY/tremor/commit/9927bfe) |
| 2026-10-31T06:12:30.347Z | `01a19096-93e0-7560-8685-383eebe7c0e1` | `the Tremor repository root` | Second review response and model efficiency | [codex-doom13.md](codex-doom13.md) | [codex-doom13-result.md](codex-doom13-result.md) | [8f0e4a9](https://github.com/NICOH-YAY/tremor/commit/8f0e4a9) |
| 2026-10-31T08:06:45.437Z | `01a190ff-2a0c-7d32-8c6d-bdf88571d1d6` | `the Tremor repository root` | Report full live evaluation honestly | [codex-doom14.md](codex-doom14.md) | [codex-doom14-result.md](codex-doom14-result.md) | [13856cb](https://github.com/NICOH-YAY/tremor/commit/13856cb) |
| 2026-10-31T21:21:24.976Z | `01a193d6-b1df-7b52-bb76-a5f620828fac` | `the Tremor repository root` | Layered music and fear response | [codex-doom15.md](codex-doom15.md) | [codex-doom15-result.md](codex-doom15-result.md) | [c042ec0](https://github.com/NICOH-YAY/tremor/commit/c042ec0) (shared commit) |
| 2026-10-31T21:38:05.467Z | `01a193e5-f9e8-72b2-aa80-548c36eaed46` | `the Tremor repository root` | Fix startup freeze from music pass | [codex-doom16.md](codex-doom16.md) | [codex-doom16-result.md](codex-doom16-result.md) | [c042ec0](https://github.com/NICOH-YAY/tremor/commit/c042ec0) (shared commit) |

| 2026-11-02T17:53:09.196Z | `01a19d64-be6f-79c3-9bae-4cb4d55288b7` | `the Tremor repository root` | Watch page, recording guide and session evidence | [codex-doom17.md](codex-doom17.md) | [codex-doom17-result.md](codex-doom17-result.md) | [2b18e48](https://github.com/NICOH-YAY/tremor/commit/2b18e48) |

The two `codex-doom6.md` launches have identical initial prompts; the metadata does not establish which produced which changes. The supplied `codex-doom7.md` is an additional follow-up prompt, with no distinct matching rollout in these 21 metadata records. `codex-doom4.md` was superseded by `codex-doom4b.md`. The music and freeze fixes landed together in c042ec0. No commit is attributed to Codex as committer.

## Additional supplied prompt/result evidence


| Prompt / evidence file | Result file |
| --- | --- |
| [codex-doom17.md](codex-doom17.md) | Not supplied |
| [codex-doom4.md](codex-doom4.md) | [codex-doom4-result.md](codex-doom4-result.md) |
| [codex-doom7.md](codex-doom7.md) | Not supplied |

`codex-doom17.md` records the watch-page and session-evidence task associated with 2b18e48. The student account is in [AGENT-TEAM.md](../../AGENT-TEAM.md).

## Additional Codex sessions

Session dates follow the supplied prompts and matching commit author dates. Associations describe purpose and time only. Codex does not commit. The interrupted codex-doom20 prompt has no supplied result, while codex-doom20b has a separate result.

| Date | Session | Purpose | Prompt | Result | Commit association |
| --- | --- | --- | --- | --- | --- |
| 2026-11-02 | codex-doom18 | Full-brief audit and trace/demo | [Prompt](codex-doom18.md) | [Result](codex-doom18-result.md) | [f7dc038](https://github.com/NICOH-YAY/tremor/commit/f7dc038) |
| 2026-11-02 | codex-doom19 | Watch replay and responsive layout | [Prompt](codex-doom19.md) | [Result](codex-doom19-result.md) | [3be1eb5](https://github.com/NICOH-YAY/tremor/commit/3be1eb5) |
| 2026-11-02 | codex-doom20 | Final review corrections, interrupted | [Prompt](codex-doom20.md) | No result supplied | No separate association |
| 2026-11-02 | codex-doom20b | Final review corrections and recording | [Prompt](codex-doom20b.md) | [Result](codex-doom20b-result.md) | [3c47234](https://github.com/NICOH-YAY/tremor/commit/3c47234) |
| 2026-11-02 | codex-doom21 | Recording follow-up | [Prompt](codex-doom21.md) | [Result](codex-doom21-result.md) | [3c47234](https://github.com/NICOH-YAY/tremor/commit/3c47234) |
| 2026-11-02 | codex-doom22 | Cross-platform upstream patch check | [Prompt](codex-doom22.md) | [Result](codex-doom22-result.md) | [338dc14](https://github.com/NICOH-YAY/tremor/commit/338dc14) |
| 2026-11-03 | codex-doom23 | Independent art terms evidence | [Prompt](codex-doom23.md) | [Result](codex-doom23-result.md) | [d803595](https://github.com/NICOH-YAY/tremor/commit/d803595) |
| 2026-11-04 | codex-doom24 | Student docs, audit skill and evidence index | [Prompt](codex-doom24.md) | [Result](codex-doom24-result.md) | [9e06475](https://github.com/NICOH-YAY/tremor/commit/9e06475) |

## Agent capabilities

| Date | Agent type or model | Role | What it produced | Evidence | Could see | Could do |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-30 | Claude Sonnet research subagent | Doom rules and source research | Research notes | [Rules research](../research/doom-rules.md) | Doom source and research task | Read sources and write research notes |
| 2026-10-30 | Three Claude Sonnet worker subagents in parallel | Renderer, mechanics and content for the retired TypeScript prototype | Worker branches and merges | [Renderer 14860bd](https://github.com/NICOH-YAY/tremor/commit/14860bd), [mechanics bd215b9](https://github.com/NICOH-YAY/tremor/commit/bd215b9), [content 2df3d79](https://github.com/NICOH-YAY/tremor/commit/2df3d79), [merge d1f17f6](https://github.com/NICOH-YAY/tremor/commit/d1f17f6), [merge 8aed0c7](https://github.com/NICOH-YAY/tremor/commit/8aed0c7), [merge 22b25f9](https://github.com/NICOH-YAY/tremor/commit/22b25f9) | Prototype repo and assigned task | Edit assigned prototype files |
| 2026-10-30 | Independent read-only reviewer | Prototype review | Findings including purge identity leakage | [Review](../reviews/independent-review-2026-10-30.md), [fix ac0e32b](https://github.com/NICOH-YAY/tremor/commit/ac0e32b) | Read-only repo access | Report findings; no edits |
| 2026-10-31 | Independent read-only reviewers, two passes | Real-engine review and second pass on 9927bfe | Findings and response records | [First pass](../reviews/independent-review-2026-10-31.md), [response](../reviews/review-response-2026-10-31.md), [second pass](../reviews/review.md), [response](../reviews/review-response.md) | Read-only repo access | Report findings; no edits |
| 2026-11-02 | Four read-only audit agents | Rubric, sources and rule map, clarity and speed, full brief | Checklists now captured in a reusable skill | [Submission audit skill](../../skills/tremor-submission-audit/SKILL.md) | Read-only repo access | Report findings; no edits |
| 2026-11-02 | Independent read-only final reviewer | Final review | Findings and response | [Final review](../reviews/review-final-2026-11-02.md), [response](../reviews/review-final-response.md) | Read-only repo access | Report findings; no edits |
| 2026-11-03 | Claude Haiku subagent | Independent Higgsfield terms check | Terms verification record | [Art credits](../../public/art/CREDITS.md) | Higgsfield terms web pages only | Read terms and report findings |
| 2026-10-31 | Gemini 3.5 Flash-Lite on Vertex | Game-playing agent under evaluation | Live action traces and outcomes | [Evaluation](../../EVALUATION.md) | Public text observation and legal action IDs only; no files, pixels or audio | Choose and submit legal action IDs |
| 2026-10-30 through 2026-11-04 | Claude Code (Opus) | Planner, prompt writer, committer, browser playtester and evaluation runner | Task prompts, commits and evidence records | [Ownership](../../AGENTS.md), [evaluation](../../EVALUATION.md) | Repo, browser and terminal | Plan, commit and push; run evaluations and browser playtests |
| 2026-11-04 | Codex | Documentation editor | Documentation and validation | [Ownership](../../AGENTS.md) | Prompt and repo in a workspace-write sandbox in the repo | Edit files, build and run tests; no commit or push |
