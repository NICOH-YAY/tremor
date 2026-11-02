Implemented the fixes and mapped every M1–M6/m1–m16 finding in [review-response.md](docs/reviews/review-response.md).

- Lossless map RLE and reversible history deltas added.
- Verified pricing, cost accounting, temperature/location, start-of-run provenance and separate timeout counters recorded.
- Docs corrected, diagnostics archived, Pages fixtures excluded.
- `tremor-level-check` invoked and logged twice in `codex-doom13`.
- All 50 tests, typecheck, build and 508 C checks pass. Baselines remain 4/28 exits.

For 285 recorded E1M1 observations, history prompts fell from **600,154 → 11,340 mean characters/call**, with maxima **612,361 → 17,640**. After-change token estimates are **2,835 mean / 4,410 max** using chars/4; actual Gemini counts and the <8k target await live validation.

`review.md` is unchanged. No live trials, C rebuilds or commits. Clean committed evaluation evidence remains pending.