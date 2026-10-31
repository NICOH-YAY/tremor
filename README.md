# TREMOR

The gun works perfectly. The person holding it does not.

Real GPL Doom engine via doomgeneric WASM, original horror rules, licensed Freedoom
Phase 1 v0.13.0 data. Browser and agent use the same simulation. Human Episode 1
plays through its ending; evaluation ends on each level exit, skill index 2.
Tuning E1M1-E1M3, seen E1M4/E1M5, fresh held-out E1M6/E1M7, seeds 17/83.

## Rules

Reach each level exit; the browser episode ends at E1M8 (E1M9 is optional). Death lets you restart the level. Hold TAB for the shared geometry route arrow, which excludes secret passages. It is designed guidance through unseen geometry.

WASD move; mouse/arrows turn; mouse Y or PgUp/PgDn look; End centers; Ctrl/click fires; E/Space uses; Shift runs; 1-7 weapons; R/right mouse READ; F STUN; Q PURGE; ? pauses for help. Settings rebind controls. Pitch clamps to +/-32 degrees; READ/STUN/PURGE follow pitch like shots. Fists deal 10x ordinary Doom fist damage.

Some humans are crew (spawn probability 90/256 for pistol/shotgun humans); crew never attack. Hold READ on an aimed human for 35 tics (1 second) to reveal identity. STUN works within 64 units for 70 tics (2 seconds), cooldown 35 tics. Hold PURGE within 64 units on a stunned human for 35 uninterrupted tics. Damage, loss of aim, release or stun expiry interrupts it. Completion consumes 1 of 2 charges per level and gives +3 rounds; both hidden identities become revealed crew. A possessed human is cured. Repeated crew purges still cost a charge.

All firearms share rounds. Each level starts with hostile count +1 rounds and fists/pistol; that HUD budget intentionally reveals the starting hostile count. Weapon pickups add no rounds. Map ammo survives with probability 64/256 (25%); dropped ammo gives 1, small pickups 2, boxes 4 rounds; backpacks give 8 (four grants of 2). Every eligible human/demon death has the same 31/256 (12.11%) drop chance. Empty guns switch to fists.

Player kills heal 15 for humans or 10 for demons, up to 100; health already above 100 stays untouched. Inherited health bonuses/spheres can reach 200. Killing any human adds aim trauma, capped at 6 for the episode, with random angular jitter proportional to trauma (TR_AIM_UNIT=16384 binary-angle units per random-byte delta per trauma). Trauma never decays. Crew cower 35 tics near visible demons within 192 units or gunfire within 512.

Fear is 0-100. Each corpse seen within 1024 units, +/-45 degrees and line of sight counts once: +1, or +2 if less than 70 tics old and closer than 256 units, identically for crew and possessed. At most 8 sight tests/tic. Fear buckets: steady <25, shaken 25-49, terrified 50-79, breaking 80-100. Hit success declines from 100% to 77/256 (30.08%); incoming damage rises linearly to 1.6x (1.0x at fear 0). Fear loses 1 after every 350 tics without new exposure and halves on level entry. Do not stare at bodies.

Halloran gives one briefing per map and rare once-per-episode beats, at least 3150 tics (90 seconds) apart. Read the Radio log for the 16KB transcript. First-time HUD hints are separate from radio. Gore, grain, weapon sway, brightness and autoaim are adjustable. Music defaults to Layered: original WAD OPL music over an audible horror score. Fear darkens and slightly lowers the OPL pitch while fear/pressure build the score. Settings offers Layered (default), Horror score, or Original; Music volume affects both layers live. Saves use Tremor 3 and browser storage; partial READ/PURGE resets on load. The inherited intermission kill percentage is combat bookkeeping, not a moral score.

## Setup and commands

Requires Node 24+ and npm. Run from this project root, or `cd midterms/nicoh-yay`
in game-dev-f26. PowerShell may require npm.cmd instead of npm.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm run engine:test
npm run eval
```

Open http://localhost:5191, Play (Freedoom), Enter the base. Mouse capture is
optional; keyboard play works without it. Owner-supplied IWADs stay local.
Settings, hints and saves stay in browser storage. Build outputs dist/ with
relative assets, suitable for hosting under a subdirectory.

Evaluation: `npm run eval -- --players baseline_aggressive,baseline_careful --cases all`.
600 actions/calls, 7 tics/action, 20s/call, five minutes/episode. Failed calls count.
Invalid actions idle for 7 tics; three invalid decisions trigger labelled wait.
Errors preserve that streak. Natural exit/death takes precedence over later limits.
Date+run ID reports: eval/results/. Raw gzip traces: eval/traces/ (ignored).
Representative traces: eval/traces-sample/. Seeds choose only an 8-bit RNG start:
17 and 273 are identical, 17 and 83 distinct; no random level generation.

Live trials require ADC credentials and GOOGLE_CLOUD_PROJECT; optional
GOOGLE_CLOUD_LOCATION defaults global. Run `npm run eval:live -- --players
model-history,model-obs-only --cases all`. Both use gemini-3.5-flash-lite, K=8
versus observation-only. The full live suite ran from clean revision `8f0e4a9` on 2026-10-31.
Aggressive/careful each exited 2/14; history/observation-only each exited 0/14.
Model episode-cap timeouts: 8/7; call timeouts: 0/0; errors: 20/11.
Estimated recorded-usage costs: $4.626329/$3.339141 at the dated prices (lower bounds). [Evaluation](EVALUATION.md), [declaration](docs/EVALUATION-PLAN.md).

CI uses committed WASM; no compiler needed. Optional source rebuild needs Python
and emsdk 6.0.13: set EMSDK root / optional EMSDK_PYTHON or put emcc on PATH.

```sh
npm run engine:headless
npm run engine:headless:test
npm run engine:build
python engine/build/artifacts.py
```

engine:wad requires Pillow. Keep corresponding GPL source with binaries.
[Build](engine/BUILD.md), [contracts](docs/CONTRACTS.md), [source map](docs/rule-source-map.md),
[decisions](docs/DECISIONS.md), [five CI kinds](tests/README.md).

## Scope and changes versus Doom

Inherited: 35Hz physics, geometry, AI, keys, doors, weapons, pickups, infighting
and intermissions. Added: crew uncertainty, READ/STUN/PURGE, trauma, healing,
scarce shared rounds, corpse fear, public route guidance, sparse radio, horror
audio and clamped Y-shear freelook. This is GPL reuse, not clean-room reconstruction.
Native 320x200 at 4:3. Route guidance is not a universal lift/teleporter solver.
Excluded from evaluation: multiplayer, Doom II, other episodes, arbitrary PWADs,
jumping and true 3D freelook. Agents use 40 macros and public descriptions, no
pixels/audio/browser menus. Retired TS raycaster/levels/tests moved to legacy/;
excluded from vitest, typecheck and build. Historical wins are not engine evidence.

## Credits and reuse

Root [LICENSE](LICENSE): GPL-2.0-or-later code. id Software GPL Doom via
[doomgeneric](https://github.com/ozkl/doomgeneric); pinned revision in
[provenance](engine/UPSTREAM.md). Redistribution/modification requires GPL terms
and corresponding source, distributed as public/engine/source.zip.
Contains Freedoom Phase 1 v0.13.0 sprites recoloured by scripts/build-tremor-wad.py;
(c) Contributors to the Freedoom project, BSD-3-Clause, modified. WAD and derived
sprites retain [BSD terms](public/wad/FREEDOOM-LICENSE.txt) and credits.
public/art/* and public/radio/lines.json are Tremor creative content, distributed
under GPL-2.0-or-later to the extent copyright applies. No exclusive copyright
claim in generated art. [Art provenance](public/art/CREDITS.md).
Nuked OPL3 is LGPL-2.1-or-later with source/relink inputs shipped.
[Third-party table](THIRD-PARTY.md). Phobos/UAC are descriptive; no affiliation
with id Software or ZeniMax. Proprietary Doom WADs do not ship.

Nicoh's personal agent-team account, peer notes, recording and course
PR remain human submission work. Codex does not invent personal testimony.

Model prompts preserve all public map information with lossless row RLE and reverse history deltas; see [contracts](docs/CONTRACTS.md). Seen/held-out baseline comparisons concern route progress and survival; completion has only been demonstrated on E1M1.
