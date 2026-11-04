Implemented and left everything uncommitted.

- Pristine doomgeneric: `e257a09527062bfb986b6e5e0780839b6cbd5b71`; no upstream file changes.
- Freedoom Phase 1 **0.13.0**, SHA-256: `7323bcc168c5a45ff10749b339960e98314740a734c30d4b9f3337001f9e703d`.
- Added Canvas 2D rendering, keyboard/pointer-lock controls, local-only WAD loading, and Web Audio DMX effects.
- Built JS/WASM, licenses, and corresponding source are included for static deployment.
- Existing TypeScript simulation remains untouched.

Verification: **106 tests pass**, typecheck passes, engine build and Vite build pass. Node ran Freedoom E1M1 for 10.04 seconds: **433 frames**, mean interval **23.06 ms**, p95 **32.04 ms**.

Remaining TODOs: MUS/OPL music; browser verification of audio and pointer lock; CPU-only Brave performance measurement; full start-to-exit playtest. Saves currently disappear on reload.

Details and file locations: [BUILD.md](../../engine/BUILD.md), [UPSTREAM.md](../../engine/UPSTREAM.md), [PATCHES.md](../../engine/PATCHES.md).