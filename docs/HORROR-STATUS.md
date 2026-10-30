# Horror implementation status

Changes are uncommitted. This is a substantial implementation with explicit
remaining requirements; it is not a claim that every requested feature is complete.

## Verification

- Browser, production headless and fixture headless WASM rebuilt.
- Engine suite: 454 assertions, zero failures.
- npm test: 117 tests in 16 files, all passing.
- npm run typecheck and npm run build pass.
- Production preview regression: simulation tic 1 before and after paused renders.
- Artifact manifest regenerated, including browser WASM/JS/source and radio text.
- No browser/apps available from UI inventory. No Brave/GPU-off paint or audible test.

## Measured performance

Stationary Freedoom E1M1, Node production WASM, approximately ten seconds:

| Metric | Before | After |
| --- | ---: | ---: |
| Presented-frame mean interval | 23.304 ms | 23.038 ms |
| Presented-frame p95 interval | 32.155 ms | 31.981 ms |
| Renderer mean CPU | not instrumented | 0.341 ms |
| Renderer p95 CPU | not instrumented | 0.948 ms |
| Native raster | 320x200 | 320x200 |

These measurements exclude Canvas, audio and browser layout/paint. High-resolution
numbers are unavailable because native 640x400 is unfinished. They are not a
worst-case combat benchmark or a claim about target Brave performance.

## Constants

TR_TERROR_RANGE=1024 units; TR_TERROR_CLOSE=256; TR_TERROR_SCAN=8 candidates/tic;
TR_TERROR_DECAY=350 tics; terror cap100; carryover50%. Normal/new body +1,
fresh close kill +2, fresh witnessed crew death +3. TR_HIT_LOSS=179: hit
threshold 256 down to77 (30.08%). Damage1.0?1.6x. TR_AMMO_KEEP=64/256;
TR_AMMO_DROP=31/256. Small ammo +2, box +4, dropped clip +1, purge +3.
TR_RADIO_COOLDOWN=3150 tics. Terror buckets: <25 steady, <50 shaken,
<80 terrified, otherwise breaking. Pitch +/-64 half-degree units, approximately
+/-32 degrees. Saves Tremor2, demos v113; previous mod formats are incompatible.

## Remaining requirements and approximations

- Native 640x400, resolution setting/automatic startup benchmark and sharp-bilinear
  presentation: unfinished. SCREENWIDTH/UI/table assumptions remain 320x200.
- Actor XYZ and player XY interpolate; angle/view-height and immediate mouse-turn
  interpolation do not. Camera/arm sway is tic-phased rather than fully interpolated.
- Objective ordering follows map linedef order, without dependency/reachability
  analysis. Preview vantage uses a nearby offset rather than collision/visibility
  search. No full episode route playtest has been completed.
- Headless radio observation contains the latest line, not the complete episode
  transcript; C also exports a bounded destructive playback event queue.
- No recorded MP3 files. speechSynthesis cannot be routed through the Web Audio
  radio filter. Its fallback receives crackle and subtitles only.
- Score uses oscillators/noise instead of sampled piano and pads. Short static
  stingers approximate whispers; reversed monster layers are absent. Attenuation
  approximates distance/occlusion; no wall traversal acoustic solver.
- Suit light is a short floor-span colormap adjustment, not a dynamic flashlight.
  Palette transforms and a small render twitch approximate monster restyling.
- Target Brave pointer lock, painting cost, settings/save reload and audible balance
  remain unverified because no browser was available.
- The test suite does not prove arbitrary IWAD objective correctness or full-route
  fast-path/slaughter-path balance. It checks directional/new exposure, carryover,
  probability rules, mercy resupply, exit fallback and cooldowns in the real engine.

## Changed files

- `docs/DECISIONS.md`
- `docs/DESIGN.md`
- `docs/HORROR-STATUS.md`
- `docs/rule-source-map.md`
- `engine/BUILD.md`
- `engine/PATCHES.md`
- `engine/build/build.py`
- `engine/build/headless.py`
- `engine/build/preview-smoke.mjs`
- `engine/build/smoke-result.json`
- `engine/build/smoke.mjs`
- `engine/doomgeneric/doomgeneric/g_game.c`
- `engine/doomgeneric/doomgeneric/p_inter.c`
- `engine/doomgeneric/doomgeneric/p_map.c`
- `engine/doomgeneric/doomgeneric/p_mobj.c`
- `engine/doomgeneric/doomgeneric/p_mobj.h`
- `engine/doomgeneric/doomgeneric/p_pspr.c`
- `engine/doomgeneric/doomgeneric/p_saveg.c`
- `engine/doomgeneric/doomgeneric/p_user.c`
- `engine/doomgeneric/doomgeneric/r_main.c`
- `engine/doomgeneric/doomgeneric/r_plane.c`
- `engine/doomgeneric/doomgeneric/r_segs.c`
- `engine/doomgeneric/doomgeneric/r_things.c`
- `engine/tremor/agent_api.c`
- `engine/tremor/tests.c`
- `engine/tremor/tremor.c`
- `engine/tremor/tremor.h`
- `public/art/CREDITS.md`
- `public/engine-headless/artifacts.json`
- `public/engine-headless/doom-test.cjs`
- `public/engine-headless/doom-test.wasm`
- `public/engine-headless/doom.cjs`
- `public/engine-headless/doom.wasm`
- `public/engine-page.js`
- `public/engine/doom.js`
- `public/engine/doom.wasm`
- `public/engine/source.zip`
- `public/horror.js`
- `public/radio/lines.json`
- `public/settings-store.js`
- `public/settings-ui.js`
- `public/startup.js`
- `public/wad/tremor.wad`
- `scripts/build-tremor-wad.py`
- `src/player_interface.ts`
- `tests/agent.test.ts`
- `tests/browser-engine.test.js`
- `tests/settings.test.js`

## Radio ids and text

- **e1m1**: This is Halloran, UAC comms. I locked myself in control when the hangar crew stopped answering. Find the way out; I will stay on this frequency.
- **e1m2**: You are inside the containment perimeter. They sealed those doors with people still working behind them. Look for a card beside the locked routes.
- **e1m3**: The treatment plant is running without its operators. Something is moving against the current. Follow the access doors toward the exit.
- **e1m4**: That station used to report every fault to me. Now every light is green and nobody answers. Find the next passage out.
- **e1m5**: This is the laboratory sector. We kept the samples cold; that did not keep them quiet. The secured route should take you onward.
- **e1m6**: The central complex is ahead. I can hear its alarm through the wall of this room. Find the access card and keep moving.
- **e1m7**: You have reached the computing wing. The terminals are still accepting names from empty desks. Look for the route beyond the locks.
- **e1m8**: The last facility is beyond this threshold. I cannot promise what waits there. Get to the exit while this channel holds.
- **e1m9**: This annex was missing from the evacuation plan. There are voices on its local channel, all using the same name. Find a route back out.
- **crew-reveal**: That one's still human. Look before you shoot.
- **crew-death**: I heard that. I'll keep the channel open.
- **crew-saved**: They're breathing. Thank you for waiting.
- **breaking**: Listen to my voice. There is still a way out.
- **static-1**: Control to anyone. Is that someone breathing on the line?
- **static-2**: There is someone outside this room. They know my name.
- **static-3**: Signal dropping. I can still hear you.
- **static-4**: Please do not answer the other channel.
- **static-5**: The banging stopped. That is worse.
- **static-6**: I thought I heard the lift. It was above me.
- **static-7**: Keep the receiver close. The walls carry sound here.
