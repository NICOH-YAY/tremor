# Midterm rubric checklist (from the CourseWorks brief, read 2026-10-30)

Paraphrased requirements for COMS E6998 sec 014 midterm, "build a game and an agent that plays it". Due Nov 7 11:59pm. 5 categories x 4 pts. One missing check caps a category at 2.

## Game and scope
- Classic reconstruction is eligible for full credit; reproduce a bounded portion of rules/experience and explain omissions and adaptations. Arcade: "one level with a fixed-step simulation" is an explicitly acceptable scope.
- 2a: TA can play start to ending with no crash or dead end.
- 1b: scope + exclusions explicit in README; cuts/changes vs Doom explained.

## Rules and sources
- 1a: rule/source map: every rule labelled code / manual / observed / assumed / design, with a locator (file+function, manual page, or our spec section). Our own rules = design, pointing to docs/DESIGN.md with rationale.
- 1c: credit originals; quote/link reuse terms; all assets original or licensed (Higgsfield art terms checked by Nicoh).

## Interface (2b, 2c, 3b)
- reset(seed) / observe(player_id) / legal_actions(player_id) / step(player_id, action) / outcome() -> ongoing|terminal + reason + score.
- Real-time game: fixed-step wrapper; DECLARE step size (tics per action) and the actions available per step.
- observe reveals only what the player can know (line of sight, FOV, unread figures stay "unknown figure"). legal_actions must NOT leak secrets (e.g. purge must not become legal only when a target is secretly Possessed): use a constant action vocabulary + validation feedback; document the choice; add a hidden-information leakage TEST.
- Player gets no repo/shell/eval tools. Runner holds authoritative state. Each episode: step limit, model-call limit, timeout policy, invalid-action handling, explicit terminal reason. Failed calls count toward budget. Fallback moves labelled, never relabelled as model moves.

## Players and experiment (4a, 4b, 5a)
- One cheap credible baseline (scripted/heuristic, not random) + one model-driven player (Vertex gemini-3.5-flash-lite is enough). Same observations and actions for both.
- Suite declared BEFORE tuning: >=3 distinct starting situations, >=2 live trials each, plus held-out cases not used for prompt tuning. Baseline on the same cases.
- Report: completion/win counts, illegal actions, step/call limits hit, latency, token usage, estimated cost with dated prices, failures, seeds, model + config ids, game version. No overclaiming.
- Partial observation => compare bounded history vs observation-only.
- 4a: each open choice (action vocabulary, step size, baseline, memory, suite) named with the alternative it beat (DECISIONS.md).

## CI (3c) — workflow .github/workflows/midterm-nicoh-yay.yml, only this folder
Five kinds, all green: rule invariants; legal and illegal actions; a terminal outcome (successful path); a genuine observed regression test; episode limits. Mocked/replayed model outputs OK in CI.

## Agent team (3d, 5b)
- Implementation agent: AGENTS.md + Codex sessions linked.
- Reusable skill: skills/ or .codex/ prompt file, invoked by name in >=2 sessions (log them).
- Independent review: fresh read-only session, did not write the code, no instruction to approve; findings committed as review.md.
- AGENT-TEAM.md one page in NICOH'S VOICE (he writes it): agents, what each could see/do, recommendations, his decisions, evidence links.

## Submission
- PR to columbia-university-ai-games/game-dev-f26 main; only midterms/nicoh-yay/ + the one workflow file. README (setup/play/test/eval commands from midterms/nicoh-yay/, scope, rule map, reuse terms), EVALUATION.md (suite, table, traces, CI evidence, limitations in his voice), AGENT-TEAM.md, peer notes (given + received, Nov 6), 3-5 min recording of the agent playing with limits stated, linked from README and PR.
- Update Week 3 thread + README scope statement since the game changed.

2026-10-31 follow-up: 4b now has genuine E1M1 normal-spawn exits and a passing
completion regression. The50% tuning-map target remains unmet; see EVALUATION.md.
For2c, route guidance is the same public TAB cue for humans and agents, and the
constant vocabulary / unread-identity equivalence tests remain required.
