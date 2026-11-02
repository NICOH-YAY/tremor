Fixed startup/intro handling, duplicate engine entry, and pointer-lock rejection handling. Music now generates nonzero samples, and the title note is updated.

Evaluation now uses bundled real-engine WASM, with updated controllers, suite, regression tests, documentation, and CI.

Validation: **115 tests passed**, typecheck passed, build passed. Everything remains **uncommitted**.

Limitations: baselines achieved **0/20 exits**—6 deaths and 14 step limits. No live Vertex trials or fresh interactive browser playtest were completed. Details are in [EVALUATION.md](/D:/Coding%20VS/tremor-wt/doom/EVALUATION.md).