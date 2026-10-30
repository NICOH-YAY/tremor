# Browser engine build

From the repository root, install/activate emsdk 6.0.13. This machine uses `D:\Coding VS\tremor-tools\emsdk`; Python is `D:\Python\python.exe`. `engine/build/build.py` honors EMSDK and EMSDK_PYTHON; defaults target those installed paths. Put Python on PATH for `npm run engine:build`, or run `D:\Python\python.exe engine/build/build.py` directly.

The script compiles the explicit upstream Makefile source list, replaces i_sound.c with its documented platform override, and links platform/*.c plus engine/tremor/tremor.c. Options include -O2, Asyncify, memory growth, MEMFS, modular ES module output, 320x200 software rendering. Asyncify is required for upstream tic waits and screen wipes to yield; requestAnimationFrame schedules the main loop, and upstream 35 Hz timing governs simulation. No SDL renderer, WebGL, server, or cross-origin isolation is needed.

`npm ci`, `npm test`, `npm run typecheck`, `npm run build`. Deploy the contents of dist/ to GitHub Pages. public/engine/doom.js and doom.wasm are prebuilt, so ordinary Vite/CI builds do not require emsdk. Relative asset URLs support a Pages project subdirectory. The 320x200 framebuffer is displayed at corrected 4:3 with pixelated Canvas 2D scaling.

`node engine/build/smoke.mjs` runs ten seconds of Freedoom E1M1 in Node, using the same framebuffer callback as a dummy canvas sink. It records actual frame intervals in smoke-result.json. It does not measure browser painting, sound output, pointer lock, or target Brave performance.

Local files are read through File.arrayBuffer and written to MEMFS as /game.wad; there is no upload or persistence. Reload to select another WAD. Only supported vanilla Doom IWADs are intended; arbitrary untrusted WAD robustness is inherited from the engine. Browser audio starts from the Play gesture. WASD/arrows, Ctrl/LMB, E/Space, Shift, weapons, menu, and automap are mapped in public/engine-page.js.

Remaining TODOs: integrate and license a MUS/OPL synth; verify sound/panning and pointer lock in target Brave; measure CPU-only browser frame timing and complete a start-to-exit playtest. Saved games/config currently live only in MEMFS and disappear on reload. The real engine now runs the Tremor mod; see PATCHES.md. The original TS simulation and agent evaluation remain available separately.


## Tremor build and checks

Generate sprites: `D:\Python\python.exe scripts/build-tremor-wad.py [path/to/selected-iwad.wad]` (requires Pillow). Default is bundled Freedoom PLAYPAL. The generated PWAD contains only original pictures, no palette or game art. For a nonstandard palette, regenerate with that IWAD before deployment. Browser and smoke runner always load `-file /tremor.wad` after the IWAD.

Build production: `D:\Python\python.exe engine/build/build.py`. Run real-engine checks: `npm run engine:test` (or `node engine/build/test.mjs`). This compiles a separate test-enabled WASM, loads Freedoom E1M1, and invokes checks against actual actor, damage, pickup, ray aiming and Tremor logic. Generated test-engine.js/.wasm are ignored and excluded from source.zip. Normal npm test needs no compiler. Run `npm test`, `npm run typecheck`, `npm run build`, and `node engine/build/smoke.mjs` after production rebuild.

Controls: R/right mouse hold READ (35 tics); F STUN (70 tics, 35-tic cooldown); hold Q within punch range of a stunned possessed human to PURGE (35 uninterrupted tics, charge consumed on completion, two per level). Damage resets purge progress. Crew are harmless; their identity is revealed only by READ. Killing any human adds trauma, capped at six for the episode; demons add none. All player monster kills heal 15 (human) or 10 (demon), capped at 100. No trauma number is drawn. Each level resets weapons to fists/pistol and gives enemies+1 shared rounds; pickups grant weapons but no rounds.

The browser starts E1M1 directly and awaits an original intro card before simulation proceeds. Escape still opens the IWAD menu. IWAD episode text screens remain untouched.

## Exported settings ABI

All four functions are EMSCRIPTEN_KEEPALIVE exports, callable as module._tremor_...:

* `tremor_set_gore(int)`: 0 off, 1 normal, 2 hyper (default), clamped.
* `tremor_set_mouse_sensitivity(int)`: Doom sensitivity, 0..30, clamped.
* `tremor_set_volumes(int sfx, int music)`: 0..15 each, clamped. Music backend remains silent.
* `tremor_bind_key(int action, int doomkey)`: actions 0 forward, 1 back, 2 strafe left, 3 strafe right, 4 turn left, 5 turn right, 6 fire, 7 use, 8 run, 9 read, 10 stun, 11 purge, 12..18 weapons 1..7, 19 automap, 20 menu. Valid key codes are 0..255. Bindings last for the session. Browser WASD/E aliases retain the port's Doom key translation; other letters map to lowercase ASCII. Right mouse dispatches the current READ binding. These are UI integration exports; no new settings panel is included.

v112 demos add one gore byte after consoleplayer in the header and an action byte after buttons in every command; longtics are mandatory. Action byte bits 0/1/2 are read/stun/purge, bits 4/5 gore, bit 6 marks recorded setting data. Recording quit Q is suppressed while Q is PURGE. Tremor 1 saves store actor identity/timers and global resources, but partial read/purge progress resets on load.

Browser UI/audio/pointer-lock playtesting could not run because UI tools reported no browser. Node verifies simulation and framebuffer output, not audible balance or browser painting. A full proprietary Doom IWAD episode playthrough remains outstanding. Music synthesis was already absent and remains absent.
