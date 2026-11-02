Changed runner trace schema, renderer UI/mapping/camera, fixture generator, sample JSONL files, regression tests/snapshot, castle texture, credits, and `docs/BUGLOG.md`.

Replay now autoplays with public state; stamina uses pips; separators are ASCII; lighting and framing are improved.

For #2, fixed delayed HUD/action-label updates. The exact `8/9` result remains unconfirmed: the Aggressor controller regression produces `[9,9]` and rejects duplicate submission.

Validation: **94 tests passed**, typecheck passed, web build passed. No commits, pushes, or model calls.