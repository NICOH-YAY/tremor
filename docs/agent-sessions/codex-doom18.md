You are Codex, sole code editor for "Tremor" in <scratchpad> (branch main, clean). This is a NEW session: first invoke the project skill by name, "tremor-level-check", follow it, and log it in docs/SKILL-INVOCATIONS.md as session codex-doom18 (and again at the end).

Course brief: <scratchpad>\midterm-brief.md where <scratchpad> = <scratchpad> . A strict full-brief audit of the submission folder found the gaps listed in <scratchpad>\audit-brief.md — fix ALL 17 items exactly as written there.

Also:
18. Model reasons in traces: the runner/trace currently drops the model's stated "reason". Record it per step in the trace (string, truncated to 300 chars, never fed back to the model beyond the existing history rules) with a test; the watch page overlay should show it when present. Add an npm script `demo:live` that runs ONE live model-history episode on E1M1 seed 17 (same config/limits) writing a demo trace to eval/demo/ (clearly labelled "demo, not part of the declared suite", not counted in EVALUATION tables) and a script to copy it to public/replays/ for the watch page. Do NOT run it (the human/Claude runs live calls).
19. Writing style for every doc you touch that a TA reads: plain sentences; no marketing language.

Rules: the student writes AGENT-TEAM.md and the limitations paragraph himself — do NOT write them. Never edit docs/reviews/review.md or independent-review-2026-10-31.md. Keep npm test, typecheck, build, engine:test green; artefact manifest LF bytes; rebuild only if needed. You cannot commit. Final summary: item-by-item status.
