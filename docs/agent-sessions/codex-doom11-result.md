The target remains **unmet**: 4/20 exits overall; careful achieves **2/6 tuning exits**, below 4/6.

| Split | Map | Aggressive exits | Careful exits |
|---|---|---:|---:|
| Tuning | E1M1 | 2/2 | 2/2 |
| Tuning | E1M2 | 0/2 | 0/2 |
| Tuning | E1M3 | 0/2 | 0/2 |
| Held-out | E1M4 | 0/2 | 0/2 |
| Held-out | E1M5 | 0/2 | 0/2 |

Added bounded retreat, repeated-cell recovery, ammunition pickups and finer READ tracking. E1M2 still fails in combat; E1M3 also stalls on activation navigation. Held-out results informed no tuning.

Careful: 34 READs, two crew saved, one killed, zero fired-unread. Aggressive: zero READs, 20 crew killed, 19 fired-unread.

Updated [evaluation and diagnosis](EVALUATION.md) and regenerated the dated reports at **600 actions**. All 126 tests, typecheck, build and 470 engine checks pass; artifact hashes match LF bytes.

No commits or pushes made.