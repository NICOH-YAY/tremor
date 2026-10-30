# TREMOR

**The gun works perfectly. The person holding it doesn't.**

Tremor runs the real Doom engine through doomgeneric WASM, with original Tremor
rules and freely licensed Freedoom Phase 1 data. The agent evaluates that same
engine and mod. The earlier TypeScript raycaster is retained as superseded
prototype source, not as the evaluated game.

## Play

Run commands from this project folder (`midterms/nicoh-yay/` in the course repo,
`D:\Coding VS\tremor-wt\doom` in the local checkout). Requires Node 24+.
In PowerShell, use `npm.cmd` if execution policy blocks `npm`.

```sh
npm ci
npm run dev
```

Open http://localhost:5191. Choose **Play (Freedoom)**, then **Enter the base**
when the introductory card appears. Doom's New Game menu starts an episode.
Click the canvas to capture the mouse; capture is optional. **Load your DOOM
WAD** reads an owner-supplied IWAD locally and never uploads it. Settings and
saves use browser storage. Music and effects use Web Audio; music is synthesized
from the selected IWAD with the original MUS/MIDI bridge and Nuked OPL3.

WASD moves; arrows turn; Ctrl/left mouse fires; E/Space uses doors and switches;
Shift runs; hold R/right mouse to READ; F stuns; hold Q nearby to PURGE;
1?7 selects weapons; Esc opens the menu; Enter selects. Settings allow rebinding.
Read an aimed human for one second to reveal crew or possessed. Stun lasts two
seconds; uninterrupted close purge takes one second, costs one of two charges,
and saves possessed humans. Crew never attack. Human kills add lasting aim
instability; kills restore health. There is no moral score in the game.

## Scope and exclusions

Supported evaluation scope: **Freedoom Episode 1**, single player, skill Hurt Me
Plenty; suite maps E1M1?E1M5. People can play the whole loaded Episode 1, including
Doom's geometry, monsters, doors, keys, weapons, pickups, and ending. Optional
local original DOOM IWAD play is supported; proprietary data is not shipped.

Excluded from evaluation: multiplayer, Doom II, arbitrary third-party PWADs,
free-look/jumping, mod compatibility, other episodes, and the prototype's custom
Hangar/Quarantine maps, collar and sealing mechanics. The agent has a bounded
macro vocabulary and partial observation, not pixels, sound, or browser menus.
It stops at a level exit rather than continuing the episode. Browser play is
real-time; the agent advances fixed seven-tic intervals. Full-map controller
completion has not yet been demonstrated; see [evaluation status](EVALUATION.md).

## Test and evaluate

```sh
npm test
npm run typecheck
npm run build
npm run eval -- --players baseline_aggressive,baseline_careful --cases E1M1,E1M2,E1M3
npm run eval
```

CI uses the checked-in Node WASM artifacts in `public/engine-headless/`, so no
emsdk is needed. Tests cover engine rule invariants, constant legal/illegal
inputs, terminal outcomes, observed regressions, identity leakage, runner budgets,
and browser startup helpers. Legacy simulation tests remain clearly separated.
The exit-switch fixture verifies real USE/exit scoring; it is not a whole-map win.

The declared [suite amendment](docs/EVALUATION-PLAN.md) is tuning E1M1/E1M2/E1M3,
held-out E1M4/E1M5, seeds 17/83. `npm run eval` executes both baselines on all
five maps and explicitly skips live model trials. Do not use held-out results to
tune prompts/controllers. Reports go to `eval/results/`; per-action traces go to
`eval/traces/` (gitignored). Limits: 600 actions, 600 calls, 20 seconds/call, five
minutes/episode. Failed calls count; fallback actions are labelled separately.

For live Vertex trials, configure Application Default Credentials and
`GOOGLE_CLOUD_PROJECT` (optional `GOOGLE_CLOUD_LOCATION`, default `global`):

```sh
npm run eval:live -- --players model-history,model-obs-only --cases E1M1,E1M2,E1M3
```

Both use `gemini-3.5-flash-lite`; history keeps eight previous observations/actions;
obs-only has none. No credentials, paid trials, verified prices or live success
results are supplied by this migration. Cost remains null until prices are
verified; transport failures may leave token usage unknown.

To rebuild with emsdk installed (not required to play/test):

```sh
npm run engine:wad
npm run engine:headless
npm run engine:headless:test
npm run engine:build
```

Set `EMSDK` and `EMSDK_PYTHON` for your installation. See
[engine build details](engine/BUILD.md), [contracts](docs/CONTRACTS.md),
[rule/source map](docs/rule-source-map.md), and [decisions](docs/DECISIONS.md).
`npm run build` creates the static site in `dist/`, including its license/source
archive. Keep the corresponding source with distributed engine binaries.

## Credits and reuse terms

- id Software's DOOM GPL source, via [doomgeneric](https://github.com/ozkl/doomgeneric),
  pinned revision and provenance in [UPSTREAM](engine/UPSTREAM.md).
  [GPL version 2 or later](engine/doomgeneric/LICENSE): redistribution/modification
  is permitted under its terms; retain copyright/license and provide corresponding
  source. The binary is not a clean-room reimplementation. New Tremor rules and
  adapters are original GPL-2.0-or-later code. See [patches](engine/PATCHES.md).
- [Freedoom](https://freedoom.github.io/) Phase 1 v0.13.0, BSD-3-Clause. The
  [full bundled terms and WAD hash](public/wad/FREEDOOM-LICENSE.txt) permit source
  and binary redistribution with attribution/conditions retained. No id WAD ships.
- [Nuked OPL3](https://github.com/nukeykt/Nuked-OPL3), Nuke.YKT, LGPL-2.1-or-later;
  [license](engine/vendor/nuked-opl3/LICENSE) and source are bundled. The MUS/MIDI
  sequencer is original. Chocolate Doom's GPL OPL implementation was consulted
  for GENMIDI structure layout; its music code is not linked or copied. See
  [dependency provenance](engine/UPSTREAM.md).
- Title and crew art were generated with Higgsfield by Nicoh; the existing art credits record that Nicoh checked
  permission under Higgsfield's terms. See [art provenance](public/art/CREDITS.md); no new license verification was performed in this migration.

Course workflow: [.github/workflows/midterm-nicoh-yay.yml](.github/workflows/midterm-nicoh-yay.yml).
Independent review, Nicoh's agent-team writeup, peer notes, live comparisons and
the final 3?5 minute recording remain submission work; no evidence is fabricated.
