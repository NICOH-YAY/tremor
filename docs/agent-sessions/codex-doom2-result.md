Implemented Tremor inside the real Doom engine and rebuilt `public/engine/`. All changes remain **uncommitted**; the pristine upstream commit is preserved.

- Core logic/constants: [tremor.c](engine/tremor/tremor.c), [tremor.h](engine/tremor/tremor.h).
- Exact changed-file inventory and reasons: [PATCHES.md](engine/PATCHES.md).
- Sprite generator/PWAD: [build-tremor-wad.py](scripts/build-tremor-wad.py), `public/wad/tremor.wad`.
- Engine tests: [tests.c](engine/tremor/tests.c), [test.mjs](engine/build/test.mjs).

Constants include 35.16% crew selection, 35-tic READ/PURGE, 70-tic stun, two purge charges, trauma cap six, healing +15/+10 capped at 100, enemies+1 rounds, x10 fists, and 8–16 hyper blood particles.

Validation passed:

- **177 engine checks**, zero failures.
- **106 project tests**, typecheck, production build, and diff checks.
- Ten-second smoke: **424 nonblank frames**.
- Source archive and deployed WASM match the current build.

Outstanding: browser layout, pointer lock, audible mix, and full-episode playtesting—UI tools reported no browser. The inherited music backend remains silent. Settings exports are implemented; no settings panel was added.