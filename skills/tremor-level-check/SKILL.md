---
name: tremor-level-check
description: Tremor level & rule check; validate a new level or rule change with tests and baseline evidence.
---
# Tremor level & rule check

1. Read AGENTS.md, docs/CONTRACTS.md, docs/RUBRIC-CHECKLIST.md and the proposed diff. Respect directory ownership.
2. Add/update the row in docs/rule-source-map.md, including code/manual/observed/assumed/design classification and exact locator.
3. Write a failing test first for the intended behavior or observed regression; run it and record failure.
4. Implement the smallest correction, then run npm test, npm run typecheck and npm run build.
5. Run npm run eval -- --players baseline_aggressive,baseline_careful --cases all. Missing content is an explicit blocker, never substitute levels. Compare completion, terminal reasons and moral metrics against prior results.
6. Record the diff, commands, outcomes, trace/result paths and remaining limitations in docs/SKILL-INVOCATIONS.md. Live trials require explicit --live. Do not invent invocations or successful results.
