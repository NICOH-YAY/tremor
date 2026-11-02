Implemented reactive personas and distinct situation seeds. Combat numbers unchanged; no commits, pushes, or model calls.

Changed files: `src/agents/index.ts`, `src/game.ts`, `src/runner/cli.ts`, `experiments/suite.json`; persona/agent/simulation tests; DESIGN, IMPLEMENTATION, rule-source map, BUGLOG, balance and review documents. All changes remain inside `midterms/nicoh-yay/`.

- **Tests:** 73 passed, 1 failed. The unchanged always-strike regression honestly fails at **19/20 wins**, against the required ≤10.
- **Typecheck:** passed.
- **Evaluation:** completed **3,200 episodes**—10 controllers × 4 personas × 4 situations × 20 trials.

The **[full balance table](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/docs/BALANCE-REACTIVE.md>)** includes every cell and unmet criterion; [detailed results](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/results/reactive-20261024/comparison.md>) include W/D/L and other metrics. Balance targets remain unmet, including always-bash winning 20/20 against Sentinel in three situations.

[BUGLOG](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/docs/BUGLOG.md>) records failing-first evidence and regressions. Independent review findings were addressed; no gate approval is claimed.

**Open proposal for Nicoh:** authorize a separate Aggressor policy experiment that prefers GUARD after repeated champion STRIKEs, then rerun the full matrix. This proposal remains unapplied and is not proven to resolve the other failing cells.