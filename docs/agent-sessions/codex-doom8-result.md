Most horror changes are implemented, but **bot completion remains unresolved**.

- Node luminance: prior **21.57 → 14.45**, now **47.1% of vanilla**.
- Added subtitle backing/placement, full view interpolation, per-frame mouse prediction, sharp-bilinear scaling, browser-only debug hooks, and episode radio history.

Latest scripted evaluation:

| Baseline | Exits | Deaths | Limits | Crew killed/saved | Reads | Fired unread |
|---|---:|---:|---:|---:|---:|---:|
| Aggressive | 0/10 | 7 | 3 | 26/0 | 0 | 124 |
| Careful | 0/10 | 9 | 1 | 3/3 | 33 | 0 |

Zero illegal actions or controller errors. Full results (historical reference) · [Horror verification](../HORROR-STATUS.md)

Checks: **120 tests pass, 1 completion TODO**; typecheck/build pass; **470 engine checks pass**. Browser/headless builds, source archive, and hashes regenerated. No commits created.

Unfinished: successful traversal and its regression test; native 640×400, which fails status-bar code; interactive Chrome verification, because no browser surface was available.