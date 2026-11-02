Implemented within `midterms/nicoh-yay/`; no commits, pushes, or model calls.

Changed files:

- `web/src/scene.ts`: low-resolution rendering, no post-processing, cheaper materials, instanced static boxes.
- `web/src/main.ts`: adaptive resolution, F3 FPS toggle, GPU banner, corrected frame timing.
- `web/src/performance.ts`: timing and quality helpers.
- `web/index.html`, `web/src/style.css`: resolution menu, pixelated scaling, DOM indicators.
- `tests/performance.test.ts`: timing, bend-charge, and quality tests.

Expect a default 480×270 resolution budget, automatically dropping to 320×180 below 40 FPS. Simulation tracks real time down to 4 FPS; longer stalls retain the requested 0.25-second cap.

Validation: **28 tests passed**, typecheck passed, build passed. Nicoh’s Brave performance still needs measurement.