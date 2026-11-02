Implemented the story flow, pause/retry controls, effects, positional audio, integration fixes, regression tests, documentation, and CI/Pages workflows. Changes remain uncommitted.

Verified:

- **98 tests pass**, plus typecheck and build.
- Both baselines complete all seven levels on both seeds: **28/28 exits**.
- Node rendering plus simulation averages **0.7–1.0 ms/frame** at 480×270.
- Negative-health regression fixed and documented.

Dev server: http://127.0.0.1:5191/

Remaining: real-browser visual/audio/pointer-lock verification and Pages deployment. The eval CLI hit a sandbox OS lookup error; headless baseline checks used the same episode runner through Vitest.