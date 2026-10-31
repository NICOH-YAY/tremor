# Tremor patch inventory

The pristine doomgeneric import remains inspectable in its existing commit. No commits were created or rewritten. Upstream hooks have `/* TREMOR: ... */` comments (short continuation hooks use `/* TREMOR */`). New mod code is original, GPL-2.0-or-later. Maps, monsters, weapon states/pellet counts, sounds and finale text come from the selected IWAD; no proprietary IWAD data is distributed.

## Changed upstream files (`engine/doomgeneric/doomgeneric/`)

| File | Reason |
| --- | --- |
| `g_game.c` | Sample READ/STUN/PURGE into existing ticcmd.buttons2; reset trauma only at new game; v112 longtics demos record the extra action byte and gore setting/changes; Q no longer ends recordings while bound to PURGE. |
| `info.c` | Register original CREW sprite name. |
| `info.h` | Add SPR_CREW without replacing existing sprites. |
| `p_inter.c` | Zero ammo pickups; crew damage-source guard; damage interrupts purge; deaths apply healing/trauma/gore and melee/close shotgun XDeath. |
| `p_mobj.c` | Classify map humans before kill counting; crew/stun bypass hostile states; suppress living crew actions; gore-off blood suppression; projectile aim error. |
| `p_mobj.h` | Per-actor crew, reveal, stun and cower fields. |
| `p_pspr.c` | Shared rounds, fists fallback, x10 fists, gunfire fear, melee impact, hitscan trauma; original weapon states and pellet counts retained. |
| `p_saveg.c` | Save actor fields and trauma/rounds/charges/saved; separate Tremor 1 format signature. Partial recognition/purge progress resets on load. |
| `p_setup.c` | Initialize rounds after map enemies counted; reset weapons/charges. |
| `p_user.c` | Recognition/mercy at simulation tic rate. |
| `r_main.c` | Render-only view sway/kick. |
| `r_things.c` | Render-only weapon sway, CREW A/B on revealed living crew, faint shaded red flicker on revealed possessed. |
| `st_stuff.c` | Primary ammo counter always shows shared rounds, including fists. |
| `w_main.c` | With -file tremor.wad, insert its CREW pictures into IWAD sprite namespace; bundled sprite-only PWAD does not trigger shareware level-mod prohibition. Other PWAD handling unchanged. |

## New files

* `engine/tremor/tremor.h`: constants, hooks and settings action enum.
* `engine/tremor/tremor.c`: original rules, wandering/fear, recognition, mercy, trauma, temptation, rounds, gore, palette translation, sprite namespace insertion, asynchronous intro hook and settings exports.
* `engine/tremor/tests.c`: headless checks against the compiled Doom engine.
* `engine/build/test.mjs`: compile test-enabled engine and run checks in Node.
* `scripts/build-tremor-wad.py`: Pillow PNG-to-Doom-picture/PWAD converter using PLAYPAL from supplied IWAD (bundled Freedoom default). A0 supplies every rotation, B0 ducks/flinches. Only original picture data is emitted.
* `public/wad/tremor.wad`: generated original CREWA0/CREWB0 PWAD.

## Other changed files

| File | Reason |
| --- | --- |
| `engine/platform/doomgeneric_web.c` | Right mouse dispatches current READ binding and releases its original held key correctly. |
| `engine/platform/sound_web.c` | Pass original effect name to web audio for gunshot/punch layering. |
| `engine/build/build.py` | Compile Tremor, export settings, test build, source archive including sprite generator/reference art; exclude generated test binaries. |
| `engine/build/smoke.mjs` | Load PWAD after IWAD. |
| `engine/build/smoke-result.json` | Latest ten-second framebuffer measurements. |
| `public/engine-page.js` | Load PWAD with -file, start E1M1, await intro, R/F/Q/right mouse controls, letter bindings, louder gun effects and synthesized thump/crack/punch. |
| `index.html` | Original pre-E1M1 UAC/Phobos premise and required twist; mercy controls. IWAD finales untouched. |
| `package.json` | engine:test and engine:wad commands. |
| `.gitignore` | Ignore generated test JS/WASM. |
| `engine/UPSTREAM.md` | Distinguish pristine import history from current patches. |
| `engine/BUILD.md` | Mod build, settings ABI, tests and limitations. |
| `docs/DESIGN.md` | Identify active engine versus retained TS prototype. |
| `public/engine/doom.js`, `public/engine/doom.wasm` | Rebuilt browser engine. |
| `public/engine/source.zip` | Rebuilt corresponding source. |

## Behavioral boundaries

Map-spawned zombiemen/shotgun guys become crew with P_Random()<90 (35.16%). Cured chaingunners also become nonattacking crew. Survivors bypass hostile states and have a second damage-source guard. Crew/cured humans do not count toward kill totals. Curing does not recalculate the original round budget. Each firearm discharge uses one round, including each automatic chaingun bullet; a shotgun discharge retains every pellet. Weapons/rounds reset each level; health follows normal IWAD transitions.

All gameplay randomness uses P_Random. Render sway, flicker and synthesized audio consume no gameplay RNG. Hyper blood does consume P_Random, so v112 demos capture gore settings. Legacy demos are readable but cannot reproduce vanilla outcomes under modified rules. Mod saves/demos have distinct formats; MEMFS-only save storage is unchanged. Multiplayer is not a supported Tremor mode.

Gore 0 suppresses new blood particles/added decorations; 1 retains vanilla blood/deaths; 2 adds 8-16 particles, persistent IWAD floor gore and 75% close-shotgun gib selection. Original corpses and mandatory brutal melee XDeath remain in all modes. Decorations persist until level unload. Near kills cause red flash without dealing damage.

Not verified here: browser pointer lock, audible mix, proprietary IWAD playthrough, full episode completion. UI tools reported no available browser. The inherited music backend is still silent; the volume export calls its API but cannot make that backend synthesize music.

## Browser settings, OPL music, IDBFS and blit update

This update supersedes the earlier silent-music/MEMFS-only boundaries above.

* `public/settings-store.js` and `settings-ui.js`: validated versioned localStorage profile, settings dialog, keyboard/mouse capture, conflict indicators, reset, video/audio/input options; gear/F10 and pause integration.
* `public/engine-page.js`, `index.html`: UI integration, live fine-grained mouse scaling/smoothing, engine translation table, master routing and selectable gun layering, integer/fit scaling, FPS, reusable framebuffer heap view; IDBFS hydration before startup and serialized save flush; gesture-unlocked ScriptProcessor FM PCM pull. Native title/demo startup replaces forced E1M1 and `-nomusic`.
* `engine/platform/doomgeneric_web.c`: physical-input translation/reference counts, settings-time exclusion from 35 Hz clock, pause before callback, pointer-based framebuffer ABI, menu-state query.
* `engine/platform/music_web.c`: original bounded MUS/SMF scheduling and GENMIDI bank/voice programming, title/level/loop/pause/volume integration via DG_music_module; KEEPALIVE PCM/rate/status exports.
* `engine/platform/sound_web.c`: remove the silent music stub; SFX bridge retained.
* `engine/vendor/nuked-opl3`: unmodified LGPL-2.1-or-later FM emulator, pinned revision/license in UPSTREAM.md.
* `engine/tremor/tremor.c/.h`: screen-shake export, original settings-ready and completed-save JS hooks.
* Upstream `d_main.c`: marked settings-ready call after config/audio initialization, before D_DoomLoop. `g_game.c`: marked flush hook after successful save rename.
* `engine/build/build.py`: compile OPL, link/export IDBFS and heap views, include browser glue in corresponding-source archive. Production JS/WASM/source rebuilt.
* Tests: settings store and callable production ABI; updated framebuffer smoke; MIDI/MUS production PCM smoke and song-transition checks. See BUILD.md for commands, verification boundaries and remaining MIDI-controller/ScriptProcessor limitations.

The browser build also marks `d_loop.c` with a single-player Emscripten-only early return when no simulation tic is due. It avoids Asyncify sleep/poll cycles inside TryRunTics, permitting rAF-rate presentation of the current state while NetUpdate retains the 35 Hz simulation clock. Other builds/network scheduling are unchanged. Blit swizzles packed 32-bit pixels into a reusable ImageData buffer. This does not add interpolated actor movement.


## Agent and browser regression amendment, 2026-10-30

Original additions: `engine/tremor/agent_api.c`,
`engine/platform/doomgeneric_headless.c`, `engine/build/headless.py`.
Headless-only changes: `d_main.c / D_DoomLoop` returns without starting real-time
frames; `m_random.c / M_ClearRandom` uses the chosen initial RNG table index;
`hu_stuff.c / HU_Ticker` captures displayed messages before Doom consumes them.
Browser `main` has a one-entry guard; JS uses noInitialRun, shared intro waiters
and caught pointer-lock promises on canvas clicks only.

`tremor.c` now records evaluator kill/read/unread-shot counters (not observations),
reveals successful purges, and checks loaded sprite frames before spawning optional
gore decorations. `r_things.c` validates the actual two-frame crew display index,
not the original hostile animation frame. This prevents crashes in Freedoom1.
Separate test-only exports provide matched crew/possessed and exit-switch fixtures.
No fixture functions are present in the production headless artifact.

Rebuild both Node targets and the browser target after C changes. `npm test` uses
bundled artifacts and never requires emsdk. Headless details and commands are in
BUILD.md; course interface details are in docs/CONTRACTS.md.


## Horror adaptation, 2026-10-30

The gun works perfectly. The person holding it does not. Corpse exposure now
produces persistent terror: new visible bodies within 1024 units count once,
with eight candidate checks per tic, a 90-degree forward view and P_CheckSight.
Fresh close kills count twice; freshly witnessed crew deaths count three times.
Map corpse and gore decorations count too. Terror is clamped to 100, loses one
point after ten seconds without new exposure, and halves on level transition.
There is no numeric terror HUD. The public felt states are steady (<25), shaken
(<50), terrified (<80), breaking (>=80). These are self-perception, not knowledge
of anyone else's identity. Gameplay rolls use P_Random. Rendering/audio do not.

At full fear, each firearm ray has a 77/256 success threshold; failed shots go
45-135 degrees wide. Fists whiff without damage. Existing trauma offsets stack.
Incoming damage rises linearly to 1.6x, before normal armor handling. Shared rounds
still start at enemies+1. Map ammo survives with probability 64/256; small pickups
give two, boxes four, death clips one. Non-crew deaths drop a clip at 31/256.
Weapons give no ammunition. A successful purge gives three rounds and a crew
subtitle. Accessibility sway does not change hit or damage rules.

The objective chooses existing locked-door keys, then their closed doors, then
an exit special (11/51/52/124). This is a conservative map-order heuristic, not a
reachability solver. Humans see the text and an automap-held bearing arrow;
agents receive the same text, bearing and near/nearby/far bucket. The browser
shows a skippable render-only glide, three seconds initially and 1.5 on changes.
Settings-time clock exclusion pauses tics. Preview renders skip NetUpdate.
Agents skip camera previews entirely.

Halloran briefs once per level, then episode-once reveal/death/save/breaking
beats and rare static fragments, with a ninety-second global cooldown. C owns
the events and a bounded queue; headless observations include the latest radio
log. public/radio/lines.json contains twenty original lines. MP3 files are
optional: filtered audio, then low speechSynthesis, then subtitles. Speech API
output cannot be routed through Web Audio, so its fallback has crackle but no
bandpass. There are no recorded MP3s in this patch.

Presentation uses cached Canvas vignette/grain and native Canvas brightness/desaturation blends,
procedural drones/notes/breathing/heartbeat, monster pitch and short convolution,
distance-derived lowpass and nonverbal idle mutters. Sector flicker is a render
hash; floor spans within 96 units get a dim suit light. Monster sprite palette
transforms cover all matching Freedoom frames/rotations; CREW stays original.

Pitch is recorded in ticcmd.lookfly, clamped to approximately +/-32 degrees,
with rebuilt centery/yslope and pitch-aware hitscan/projectiles. PgUp/PgDn/End
are rebindable; mouse Y, invert Y and autoaim are settings. Render interpolation
covers actor XYZ and player XY. Turns remain tic-based; arm inertia is cosmetic.
Saves use Tremor 2 and demos v113; older mod formats are rejected. Do not claim
compatibility with the previous save/demo byte layout.

Limitations: native rendering remains 320x200. True 640x400, its benchmark-driven
selection/resolution setting and sharp-bilinear output are not implemented; the
vanilla renderer and UI assume 320x200. Full camera angle/view-height interpolation
and immediate per-frame mouse turning are not implemented. Objective ordering is
map order, with no dependency/reachability proof, and previews use a nearby offset
rather than searching a collision-free vantage. Radio observations keep the latest
line, rather than a complete episode transcript. The score approximates pads and
piano with oscillators; no sampled piano, reversed monster layers or separately
mixed whisper stingers. Canvas composite paint cost and audible mix remain unverified.
No browser/apps were available from UI inventory, so Brave pointer-lock, CPU-only
Canvas timing and an episode playthrough could not be verified.

## Codex session codex-doom12 (2026-10-31)
Completed purge parity, identity-neutral corpse/drop/radio, cosmetic RNG, above100
healing, pitch-aware interaction aim, secret route barriers, cached/demand route,
corpse cursor removal hook, event-driven quest planning, step events,600cap,
shipped C suite, LF/source manifest, no Asyncify/synchronous pause/direct wipes,
hold TAB, text-only Freedoom BEX replacements, directional hurt/HUD hint exports,
load invalidation. Original upstream history/screenshots retained. Prior notes
about P_Random hyper blood are superseded: gore now uses M_Random.
