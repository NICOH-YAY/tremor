Implemented inside `midterms/nicoh-yay/`. No commits, pushes, or model calls.

GUARD now deals **1 riposte damage** when blocking STRIKE, retaining existing stamina loss and footing behavior.

S2’s defect was sparse contexts reverting to uniform predictions despite observed opponent habits. The fix pools global evidence into local contexts. A controlled comparison with riposte fixed improved S2 from **7/20 to 11/20**. Failing-before-fix evidence is recorded in `docs/BUGLOG.md`.

Wins out of 20:

| Declared cell | Baseline | Best single-action bot | Random | (a) |
|---|---:|---:|---:|---|
| S1/Aggressor | 17 | 17 | 6 | PASS |
| S2/Sentinel | 11 | 20 | 8 | **FAIL** |
| S3/Opportunist | 19 | 19 | 6 | PASS |
| X1/Adapter | 16 | 7 | 5 | PASS |

| Adapter situation | Highest single-action wins | (b) |
|---|---:|---|
| S1 | 5 | PASS |
| S2 | 1 | PASS |
| S3 | 5 | PASS |
| X1 | 7 | PASS |

Full matrix and history: [BALANCE-FINAL.md](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/docs/BALANCE-FINAL.md>).

Validation:

- `npm test`: **78 passed**
- `npm run typecheck`: **PASS**
- Full eval and balance: **3,520 episodes each**
- `npm run balance`: **exit 1**, explicitly reporting unmet criterion (a)
- Independent review: **No findings**

Changed files include engine/prior/prompt code; payoff, regression and snapshot tests; `package.json`; `experiments/balance.mjs`; README; rule map, DESIGN, IMPLEMENTATION, BUGLOG, balance, validation and review docs; evaluation artifacts.

Balance acceptance now lives in `npm run balance`. Existing CI commands remain unchanged and pass locally; rule/regression tests remain gated. Hosted CI was not run.

Open proposals: investigate Sentinel’s response model and depth-related horizon effects. No further tuning applied.