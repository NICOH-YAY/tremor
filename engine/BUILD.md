# Browser engine build

From the repository root, install/activate emsdk 6.0.13. This machine uses `D:\Coding VS\tremor-tools\emsdk`; Python is `D:\Python\python.exe`. `engine/build/build.py` honors EMSDK and EMSDK_PYTHON; defaults target those installed paths. Put Python on PATH for `npm run engine:build`, or run `D:\Python\python.exe engine/build/build.py` directly.

The script compiles the explicit upstream Makefile source list, replaces i_sound.c with its documented platform override, and links only platform/*.c. Options include -O2, Asyncify, memory growth, MEMFS, modular ES module output, 320x200 software rendering. Asyncify is required for upstream tic waits and screen wipes to yield; requestAnimationFrame schedules the main loop, and upstream 35 Hz timing governs simulation. No SDL renderer, WebGL, server, or cross-origin isolation is needed.

`npm ci`, `npm test`, `npm run typecheck`, `npm run build`. Deploy the contents of dist/ to GitHub Pages. public/engine/doom.js and doom.wasm are prebuilt, so ordinary Vite/CI builds do not require emsdk. Relative asset URLs support a Pages project subdirectory. The 320x200 framebuffer is displayed at corrected 4:3 with pixelated Canvas 2D scaling.

`node engine/build/smoke.mjs` runs ten seconds of Freedoom E1M1 in Node, using the same framebuffer callback as a dummy canvas sink. It records actual frame intervals in smoke-result.json. It does not measure browser painting, sound output, pointer lock, or target Brave performance.

Local files are read through File.arrayBuffer and written to MEMFS as /game.wad; there is no upload or persistence. Reload to select another WAD. Only supported vanilla Doom IWADs are intended; arbitrary untrusted WAD robustness is inherited from the engine. Browser audio starts from the Play gesture. WASD/arrows, Ctrl/LMB, E/Space, Shift, weapons, menu, and automap are mapped in public/engine-page.js.

Remaining TODOs: integrate and license a MUS/OPL synth; verify sound/panning and pointer lock in target Brave; measure CPU-only browser frame timing and complete a start-to-exit playtest. Saved games/config currently live only in MEMFS and disappear on reload. No moral mechanics are added in this session; the original TS simulation and agent evaluation remain untouched.
