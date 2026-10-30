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

## Browser settings, music and persistent saves (2026-10-30)

The gear button or F10 opens the HTML settings dialog on the landing screen, title/demo or during play. All 22 actions accept keyboard or mouse input; rebinding replaces that action's aliases. Duplicate bindings are flagged and the first listed action wins. Reset restores the complete default profile. The validated, versioned profile lives at localStorage `tremor.settings.v1`. Browser bindings populate the C platform translation table through `tremor_translate_key`/`tremor_input`; aliases share key reference counts. Doom config files are not used as the rebinding transport. Browser settings are reapplied after engine configuration/audio initialization.

The dialog releases held input and pointer lock, suspends the engine callback, and subtracts elapsed settings time from the platform clock. Simulation remains 35 Hz with requestAnimationFrame presentation. Blit receives a framebuffer pointer and reuses its typed-array view until memory growth; ImageData is also reused. FPS reports presented frames. Integer scale uses a 320x240 corrected display rectangle; fit preserves 4:3. Sensitivity is a floating point browser multiplier with retained fractional deltas; the engine sensitivity export is set to zero to avoid multiplying two sliders. Smoothing averages pending horizontal motion; there is no vertical look.

Music is enabled, including the engine title/demo sequence and native per-level transitions. An original bounded MUS and Standard MIDI File sequencer drives the selected IWAD's GENMIDI bank through vendored Nuked OPL3. Both formats matter: the bundled Freedoom 0.13 WAD actually contains MThd MIDI lumps. The implementation supports 18 OPL3 two-operator voices, double-voice/fixed-pitch instruments, program/volume/pitch events and voice stealing. It is an FM backend, not a sample soundfont. It is not a bit-identical recreation of Chocolate Doom's voice allocation or mixing. MIDI sustain, expression and pan controllers are currently ignored. Audio starts/resumes on a user gesture. A 2048-frame stereo ScriptProcessor pulls WASM samples; this compatibility fallback runs on the main thread and may underrun under heavy load. AudioWorklet off-thread synthesis is not implemented.

`/persist` is mounted using IDBFS and hydrated before `callMain`; the working directory is moved there so Doom's `./.savegame` directory is persistent. Completed save rename calls `TR_FlushSaves`, with serialized syncfs writes and surfaced errors. Config files also live there. This replaces the earlier MEMFS-only limitation. Browser storage restrictions/clearing can still prevent/remove persistence.

Additional ABI exports (KEEPALIVE): `tremor_translate_key(slot,key)`, `tremor_input(slot,down)`, `tremor_menu_active()`, `tremor_set_screen_shake(enabled)`, `tremor_music_rate(hz)`, `tremor_music_render(frames)` (pointer to static interleaved int16 stereo, maximum 4096 frames), `tremor_music_active()`, `tremor_music_song_serial()`. Rendering and music consumers must refresh heap views when memory grows. The framebuffer callback now takes a pointer rather than an allocated byte view.

Checks: `npm test`, `npm run typecheck`, `npm run build`, `npm run engine:test`, `node engine/build/smoke.mjs`, `node engine/build/music-smoke.mjs`, and `node engine/build/music-smoke.mjs --mus`. The music smoke checks nonzero production PCM for title and level and a changed song serial; the MUS variant substitutes an original tiny test tune into the in-memory WAD without modifying bundled assets. Settings tests cover defaults, aliases, rebinds, conflicts, persistence, validation, and blocked storage. Production ABI tests instantiate the distributed module. Browser/Brave audible output, pointer lock, reload/IndexedDB save restoration, and real CPU profiling still require browser verification: this session's UI inventory had no browsers/apps.
