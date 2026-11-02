# Codex session evidence

This is a factual evidence index, not the student-authored agent team log. Link this file and [AGENTS.md](../../AGENTS.md) from the submission PR. The 21 local rollouts dated October 30-31 were indexed from session metadata and the initial user prompt only. Raw rollout JSONL contains local machine details: it is retained locally and available on request, and is not copied into this repository. Timestamps below are UTC from metadata (filenames use local time). Working directories are historical facts.

Prompt/result markdown is copied from the supplied scratchpad verbatim except absolute local temp paths replaced with `<scratchpad>` and secret redaction if necessary. A credential-pattern scan found no secrets. Missing result files are identified explicitly. Commit associations use the first subsequent matching `git log` author time and purpose; they are temporal evidence, not proof that Codex authored or committed a commit. Claude commits. Purpose matching excludes unrelated art commits that occurred during agent work. Shared commits and interrupted/repeated sessions are disclosed.

| Date/time UTC | Session id | Working directory | Purpose | Prompt | Result | Resulting commit (time association) |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-30T06:42:22.950Z | `01a18b8b-901e-7720-9f78-c9f3c0e645ec` | `D:\Coding VS\tremor` | Initial Tremor scaffold | [codex-tremor1.md](codex-tremor1.md) | [codex-tremor1-result.md](codex-tremor1-result.md) | [747ae7c](https://github.com/NICOH-YAY/tremor/commit/747ae7c) |
| 2026-10-30T06:51:03.548Z | `01a18b93-857c-7163-a927-d154c83638a9` | `D:\Coding VS\tremor-wt\agent` | Course interface, agents, runner | [codex-tremor-agent.md](codex-tremor-agent.md) | [codex-tremor-agent-result.md](codex-tremor-agent-result.md) | [645f597](https://github.com/NICOH-YAY/tremor/commit/645f597) |
| 2026-10-30T06:59:47.312Z | `01a18b9b-83b0-7301-b7b4-30308408d9f8` | `D:\Coding VS\tremor` | Integrate renderer/mechanics/content/agent work | [codex-tremor-integrate.md](codex-tremor-integrate.md) | [codex-tremor-integrate-result.md](codex-tremor-integrate-result.md) | [9a17e08](https://github.com/NICOH-YAY/tremor/commit/9a17e08) |
| 2026-10-30T07:20:47.489Z | `01a18bae-bbe8-70a3-94b8-2f6b9dcf5a50` | `D:\Coding VS\tremor` | Presentation polish after browser playtest | [codex-tremor-polish.md](codex-tremor-polish.md) | [codex-tremor-polish-result.md](codex-tremor-polish-result.md) | [14180b8](https://github.com/NICOH-YAY/tremor/commit/14180b8) |
| 2026-10-30T07:28:43.411Z | `01a18bb5-ff4a-7853-90e8-080527f403c1` | `D:\Coding VS\tremor` | Independent-review fixes and CI | [codex-tremor-fix1.md](codex-tremor-fix1.md) | [codex-tremor-fix1-result.md](codex-tremor-fix1-result.md) | [ac0e32b](https://github.com/NICOH-YAY/tremor/commit/ac0e32b) |
| 2026-10-30T14:54:57.815Z | `01a18d4e-86c0-7eb3-8033-8ee09174c293` | `D:\Coding VS\tremor-wt\doom` | Vendor doomgeneric and port browser engine | [codex-doom1.md](codex-doom1.md) | [codex-doom1-result.md](codex-doom1-result.md) | [4afe400](https://github.com/NICOH-YAY/tremor/commit/4afe400) |
| 2026-10-30T15:02:30.962Z | `01a18d55-76a1-7422-9c70-c6b7ffadd2f8` | `D:\Coding VS\tremor-wt\doom` | Implement Tremor mod in Doom | [codex-doom2.md](codex-doom2.md) | [codex-doom2-result.md](codex-doom2-result.md) | [9bba987](https://github.com/NICOH-YAY/tremor/commit/9bba987) |
| 2026-10-30T15:21:05.402Z | `01a18d66-780e-7493-8028-28972a1e0cfa` | `D:\Coding VS\tremor-wt\doom` | Settings, audio and persistent saves | [codex-doom3.md](codex-doom3.md) | [codex-doom3-result.md](codex-doom3-result.md) | [7537cb9](https://github.com/NICOH-YAY/tremor/commit/7537cb9) |
| 2026-10-30T15:36:23.217Z | `01a18d74-7953-7e90-9871-67752994089f` | `D:\Coding VS\tremor-wt\doom` | Browser start fixes and real-engine agent adapter | [codex-doom4b.md](codex-doom4b.md) | [codex-doom4-result.md](codex-doom4-result.md) (shared task; prompt superseded doom4) | [ac7be97](https://github.com/NICOH-YAY/tremor/commit/ac7be97) |
| 2026-10-30T16:05:16.624Z | `01a18d8e-ea64-7ba2-814e-c8796be06a3d` | `D:\Coding VS\tremor` | Cross-OS artifact hashes | [codex-doom5.md](codex-doom5.md) | [codex-doom5-result.md](codex-doom5-result.md) | [8525b5d](https://github.com/NICOH-YAY/tremor/commit/8525b5d) |
| 2026-10-30T23:02:26.909Z | `01a18f0c-d6ca-7052-a630-e56625372beb` | `D:\Coding VS\tremor` | Horror presentation pass | [codex-doom6.md](codex-doom6.md) | [codex-doom6-result.md](codex-doom6-result.md) | [27f662b](https://github.com/NICOH-YAY/tremor/commit/27f662b) (same prompt launched twice; contribution split unverified) |
| 2026-10-30T23:03:30.558Z | `01a18f0d-d3cd-7720-bde3-41de9c61bca1` | `D:\Coding VS\tremor` | Horror presentation pass | [codex-doom6.md](codex-doom6.md) | [codex-doom6-result.md](codex-doom6-result.md) | [27f662b](https://github.com/NICOH-YAY/tremor/commit/27f662b) (same prompt launched twice; contribution split unverified) |
| 2026-10-30T23:27:33.477Z | `01a18f23-d5d7-7ee1-aea5-28e8f706d47b` | `D:\Coding VS\tremor` | Lighting, subtitle, interpolation, navigation | [codex-doom8.md](codex-doom8.md) | [codex-doom8-result.md](codex-doom8-result.md) | [d608349](https://github.com/NICOH-YAY/tremor/commit/d608349) |
| 2026-10-31T01:01:28.661Z | `01a18f79-d247-7e90-a2e7-152a3f116521` | `D:\Coding VS\tremor` | Baseline navigation and completion | [codex-doom9.md](codex-doom9.md) | [codex-doom9-result.md](codex-doom9-result.md) | [93f5646](https://github.com/NICOH-YAY/tremor/commit/93f5646) (shared commit) |
| 2026-10-31T01:29:28.763Z | `01a18f93-7789-79d2-89b9-79dd3899079e` | `D:\Coding VS\tremor` | LF normalization of manifest-listed text | [codex-doom10.md](codex-doom10.md) | [codex-doom10-result.md](codex-doom10-result.md) | [93f5646](https://github.com/NICOH-YAY/tremor/commit/93f5646) (shared commit) |
| 2026-10-31T05:12:57.244Z | `01a19060-0be0-7092-9381-bcfea4df87db` | `D:\Coding VS\tremor` | Baseline retreat/recovery and supplies | [codex-doom11.md](codex-doom11.md) | [codex-doom11-result.md](codex-doom11-result.md) | [c6316ff](https://github.com/NICOH-YAY/tremor/commit/c6316ff) |
| 2026-10-31T05:24:08.599Z | `01a1906a-4ee6-7ca3-927b-d19c1592e097` | `D:\Coding VS\tremor` | Audit/review/playtest response | [codex-doom12.md](codex-doom12.md) | [codex-doom12-result.md](codex-doom12-result.md) | [9927bfe](https://github.com/NICOH-YAY/tremor/commit/9927bfe) |
| 2026-10-31T06:12:30.347Z | `01a19096-93e0-7560-8685-383eebe7c0e1` | `D:\Coding VS\tremor` | Second review response and model efficiency | [codex-doom13.md](codex-doom13.md) | [codex-doom13-result.md](codex-doom13-result.md) | [8f0e4a9](https://github.com/NICOH-YAY/tremor/commit/8f0e4a9) |
| 2026-10-31T08:06:45.437Z | `01a190ff-2a0c-7d32-8c6d-bdf88571d1d6` | `D:\Coding VS\tremor` | Report full live evaluation honestly | [codex-doom14.md](codex-doom14.md) | [codex-doom14-result.md](codex-doom14-result.md) | [13856cb](https://github.com/NICOH-YAY/tremor/commit/13856cb) |
| 2026-10-31T21:21:24.976Z | `01a193d6-b1df-7b52-bb76-a5f620828fac` | `D:\Coding VS\tremor` | Layered music and fear response | [codex-doom15.md](codex-doom15.md) | [codex-doom15-result.md](codex-doom15-result.md) | [c042ec0](https://github.com/NICOH-YAY/tremor/commit/c042ec0) (shared commit) |
| 2026-10-31T21:38:05.467Z | `01a193e5-f9e8-72b2-aa80-548c36eaed46` | `D:\Coding VS\tremor` | Fix startup freeze from music pass | [codex-doom16.md](codex-doom16.md) | [codex-doom16-result.md](codex-doom16-result.md) | [c042ec0](https://github.com/NICOH-YAY/tremor/commit/c042ec0) (shared commit) |

| 2026-11-02T17:53:09.196Z | `01a19d64-be6f-79c3-9bae-4cb4d55288b7` | `D:\Coding VS\tremor` | Watch page, recording guide and session evidence (current task) | [codex-doom17.md](codex-doom17.md) | [codex-doom17-result.md](codex-doom17-result.md) | Uncommitted; Codex must not commit |

The two `codex-doom6.md` launches have identical initial prompts; the metadata does not establish which produced which changes. The supplied `codex-doom7.md` is an additional follow-up prompt, with no distinct matching rollout in these 21 metadata records. `codex-doom4.md` was superseded by `codex-doom4b.md`. The music and freeze fixes landed together in c042ec0. No commit is attributed to Codex as committer.

## Additional supplied prompt/result evidence

Earlier design and abandoned prototype files are retained as historical context; their presence does not claim they implemented the active Doom engine or were sessions on October 30-31. `codex-design.md` is the supplied design response to `codex-design-prompt.md`.

| Prompt / evidence file | Result file |
| --- | --- |
| [codex-audit.md](codex-audit.md) | [codex-audit-result.md](codex-audit-result.md) |
| [codex-build1.md](codex-build1.md) | [codex-build1-result.md](codex-build1-result.md) |
| [codex-design-prompt.md](codex-design-prompt.md) | [codex-design.md](codex-design.md) |
| [codex-doom17.md](codex-doom17.md) | Not supplied |
| [codex-doom4.md](codex-doom4.md) | [codex-doom4-result.md](codex-doom4-result.md) |
| [codex-doom7.md](codex-doom7.md) | Not supplied |
| [codex-fix1.md](codex-fix1.md) | [codex-fix1-result.md](codex-fix1-result.md) |
| [codex-fix2.md](codex-fix2.md) | [codex-fix2-result.md](codex-fix2-result.md) |
| [codex-fix3.md](codex-fix3.md) | [codex-fix3-result.md](codex-fix3-result.md) |
| [codex-fix4.md](codex-fix4.md) | [codex-fix4-result.md](codex-fix4-result.md) |
| [codex-fix5.md](codex-fix5.md) | [codex-fix5-result.md](codex-fix5-result.md) |
| [codex-fix6.md](codex-fix6.md) | [codex-fix6-result.md](codex-fix6-result.md) |
| [codex-plan2.md](codex-plan2.md) | [codex-plan2-result.md](codex-plan2-result.md) |
| [codex-render-fix.md](codex-render-fix.md) | [codex-render-fix-result.md](codex-render-fix-result.md) |
| [codex-render.md](codex-render.md) | [codex-render-result.md](codex-render-result.md) |
| [codex-sc1.md](codex-sc1.md) | [codex-sc1-result.md](codex-sc1-result.md) |
| [codex-sc2.md](codex-sc2.md) | [codex-sc2-result.md](codex-sc2-result.md) |
| [codex-vault1.md](codex-vault1.md) | [codex-vault1-result.md](codex-vault1-result.md) |
| [codex-vault2.md](codex-vault2.md) | [codex-vault2-result.md](codex-vault2-result.md) |
| [codex-vault3.md](codex-vault3.md) | [codex-vault3-result.md](codex-vault3-result.md) |
| [codex-vault4.md](codex-vault4.md) | [codex-vault4-result.md](codex-vault4-result.md) |

`codex-doom17.md` is the current watch-page/session-evidence task. Its result is recorded alongside this index; no resulting commit exists yet. No AGENT-TEAM.md has been generated.

## Other agents (roles and evidence only)

| Agent | Role | Evidence |
| --- | --- | --- |
| Claude Code | Planner, reviewer, committer, playtester, evaluation runner | Prompt/result files above; git log; [evaluation](../../EVALUATION.md) |
| Claude Sonnet read-only audit subagents | Rubric; sources/rule map; clarity/efficiency; full-brief audits | Supplied audit findings referenced in [doom12 prompt](codex-doom12.md) |
| Independent reviewer, first pass | Read-only independent review | [2026-10-31 review](../reviews/independent-review-2026-10-31.md) |
| Independent reviewer, second pass | Read-only independent review | [review.md](../reviews/review.md) |
| Higgsfield | Art | [Art credits](../../public/art/CREDITS.md) |
| Vertex Gemini 3.5 Flash-Lite | Game-playing agent | [Evaluation](../../EVALUATION.md); [live trace provenance](../../eval/traces-sample/manifest.json) |
