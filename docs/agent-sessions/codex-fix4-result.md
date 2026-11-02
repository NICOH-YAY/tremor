Implemented the contextual Laplace opponent model, tell-based Bayes update, depth-3 search integration, ablations, and non-interference tests. **Both balance criteria still fail.** No combat numbers or persona policies changed; no commits, pushes, or model calls.

Changed files: `src/agents/index.ts`, `src/runner/cli.ts`, `tests/agents.test.ts`, replacement `tests/regression/balance.test.ts`, regression README, balance/design/implementation/buglog/test-result docs, and new evaluation artifacts. Historical evidence is preserved. Full report: [BALANCE-FINAL.md](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/docs/BALANCE-FINAL.md>).

Validation: **77 tests passed, 6 balance acceptance tests failed**; typecheck passed; evaluation completed **3,520 episodes**.

All entries below are wins/20. S/B/G/R/E = always-STRIKE/BASH/GUARD/RECOVER/SIDESTEP.

| Declared cell | Baseline | S | B | G | R | E | Random | (a) |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| S1/Aggressor | 17 | 19 | 0 | 0 | 0 | 0 | 4 | FAIL |
| S2/Sentinel | 5 | 9 | 20 | 0 | 0 | 0 | 7 | FAIL |
| S3/Opportunist | 18 | 20 | 11 | 0 | 0 | 0 | 4 | FAIL |
| X1/Adapter | 18 | 15 | 4 | 0 | 0 | 0 | 6 | PASS |

| Adapter cell | Baseline | S | B | G | R | E | Random | (b) |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| S1/Adapter | 20 | 14 | 4 | 0 | 0 | 0 | 4 | FAIL |
| S2/Adapter | 12 | 8 | 1 | 0 | 0 | 0 | 5 | PASS |
| S3/Adapter | 18 | 13 | 3 | 0 | 0 | 0 | 5 | FAIL |
| X1/Adapter | 18 | 15 | 4 | 0 | 0 | 0 | 6 | FAIL |

Open proposals, **not applied**:

- Test global-frequency backoff for sparse contexts; S2 baseline regressed and also loses to random.
- Separately test increasing Adapter’s existing `.80` counter preference. Baseline changes cannot fix its always-STRIKE match results.