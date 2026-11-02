Implemented within `midterms/nicoh-yay/`. No commits, pushes, or model calls.

- Changed `src/game.ts` and both runners to commit player 1 first, show player 0 the pending tell, then resolve. Early commits reject without state changes.
- Updated expectimax with Bayesian tell weighting and time-up evaluation.
- Added regressions, updated snapshots and rule/design documentation, and prepared the independent-review handoff.
- Organized current and historical episode traces under `results/traces/`.

Validation: **37 tests passed**, typecheck passed, and **400 offline episodes** completed.

New baseline results, **W/D/L**, 20 trials per cell:

| Agent | S1 | S2 | S3 | X1 |
|---|---|---|---|---|
| Depth 3 | 17/3/0 | 11/2/7 | 19/1/0 | 20/0/0 |
| Depth 1 | 13/7/0 | 12/1/7 | 13/6/1 | 17/2/1 |
| Depth 3 weighted | 17/3/0 | 11/2/7 | 19/1/0 | 20/0/0 |
| Always-strike | 13/7/0 | 12/4/4 | 18/2/0 | 18/2/0 |
| Random | 0/1/19 | 5/1/14 | 1/1/18 | 2/0/18 |

**The dominance target remains unmet**, especially S2. The diagnosis and proposals are recorded in `docs/TEST-RESULTS.md`: improve history-conditioned policy inference first; possible balance experiments for Nicoh are removing Sentinel’s retaliation or increasing BASH damage against GUARD from 2 to 3. Neither balance change was applied.

BUGLOG entries pin the observed tell-timing bug and missing Bayesian weighting to regression tests that failed before implementation. S1/X1 testimony differs by witness order only; both retain posterior 1/2. Independent review remains pending.