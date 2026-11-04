Updated [EVALUATION.md](../../EVALUATION.md), README, reproducible aggregation script, two live trace samples and their SHA-256 manifest. Fixed documentation typos and preserved Nicoh’s limitations TODO.

| Player | Exits | Deaths | Step limits | Episode timeouts | Errors | Est. USD |
|---|---:|---:|---:|---:|---:|---:|
| baseline_aggressive | 2/14 | 10 | 2 | 0 | 0 | $0 |
| baseline_careful | 2/14 | 10 | 2 | 0 | 0 | $0 |
| model-history | 0/14 | 6 | 0 | 8 | 20 | $4.626329 |
| model-obs-only | 0/14 | 7 | 0 | 7 | 11 | $3.339141 |

All call timeouts were zero. Model costs are lower bounds at the verified 2026-10-31 prices.

Passed: 50 tests, typecheck, build, and 508 engine checks. Verified hashes and reproduced tables. No new evaluations, gameplay/controller changes, or commits.