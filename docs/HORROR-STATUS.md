# Horror implementation status - 2026-10-31

Current mechanics and rationale are maintained in [DESIGN](DESIGN.md),
[RULES](RULES.md), and [contracts](CONTRACTS.md). This replaces the stale follow-up
status that cited obsolete tests and baseline outcomes.

The recorded prior scripted suite completed 4/28 episodes, all exits on E1M1.
Seen/held-out results demonstrate progress/survival comparisons, not completion.
Current validation and the codex-doom13 rerun are logged in
[skill invocations](SKILL-INVOCATIONS.md); exact runs are in [EVALUATION](../EVALUATION.md).
No live model trials were run in codex-doom13. Human playthrough, target-browser
audio/visual QA, clean committed evidence and live comparisons remain pending.

Browser story polling is 4Hz regardless of visibility. Route updates with TAB
closed are gated by 35 advancing simulation tics; there is no hidden-tab throttle.
