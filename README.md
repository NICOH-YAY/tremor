# TREMOR

## Submission artifacts

- [Evaluation](EVALUATION.md).
- [Agent team account](AGENT-TEAM.md): student reflection pending.
- Recording: RECORDING LINK — to be added.
- [Peer notes](docs/peer-notes/README.md).
- [Agent sessions](docs/agent-sessions/README.md).
- [First independent review](docs/reviews/independent-review-2026-10-31.md) and [response](docs/reviews/review-response-2026-10-31.md); [second review](docs/reviews/review.md) and [response](docs/reviews/review-response.md); [final review](docs/reviews/review-final-2026-11-02.md) and [response](docs/reviews/review-final-response.md).
- Course PR Actions run URL + SHA: to be added after the PR opens.

## Scope change

The Week 3 scope record was Robotron: 2084 (Williams, 1982), waves 1-4. No license was found for its source. On 2026-10-30 the project moved to Doom Episode 1 because the GPL engine permits reuse. The retired TypeScript prototype is in legacy/.

Reference game: Doom (id Software, 1993), Episode 1 'Knee-Deep in the Dead', played here on Freedoom Phase 1 v0.13.0 data; no proprietary IWAD shipped.

## Specification at a glance

The human episode runs through Episode 1 to the E1M8 finale. The course API resets one Freedoom E1Mx map with reset(seed), skill index 2, a pistol start, hostile count +1 rounds, zero trauma and initially steady terror. The seed selects an 8-bit RNG start. There are 40 constant action IDs with validation feedback. Each action advances seven tics; compound macros hold their named controls. READ and PURGE require 35 continuous tics. Exit scores 100; all other endings score 0. Moral metrics are descriptive. Termination reasons are exit, dead, step_limit (600), call_limit (600), or timeout (20 seconds per call, five minutes per episode). See [contracts](docs/CONTRACTS.md) for the five operations and invalid-action policy.

The current rule map is [docs/rule-source-map.md](docs/rule-source-map.md). Superseded specifications and maps are history only.



## Rules

Reach each level exit; the browser episode ends at E1M8 (E1M9 is optional). Death lets you restart the level. Hold TAB for the shared geometry route arrow, which excludes secret passages. It is designed guidance through unseen geometry.

WASD move; mouse/arrows turn; mouse Y or PgUp/PgDn look; End centers; Ctrl/click fires; E/Space uses; Shift runs; 1-7 weapons; R/right mouse READ; F STUN; Q PURGE; ? pauses for help. Settings rebind controls. Pitch clamps to +/-32 degrees; READ/STUN/PURGE follow pitch like shots. Fists deal 10x ordinary Doom fist damage.

Some humans are crew (spawn probability 90/256 for pistol/shotgun humans); crew never attack. Hold READ on an aimed human for 35 tics (1 second) to reveal identity. STUN works within 64 units for 70 tics (2 seconds), cooldown 35 tics. Hold PURGE within 64 units on a stunned human for 35 uninterrupted tics. Damage, loss of aim, release or stun expiry interrupts it. Completion consumes 1 of 2 charges per level and gives +3 rounds; both hidden identities become revealed crew. A possessed human is cured. Repeated crew purges still cost a charge.

All firearms share rounds. Each level starts with hostile count +1 rounds and fists/pistol; that HUD budget intentionally reveals the starting hostile count. Weapon pickups add no rounds. Map ammo survives with probability 64/256 (25%); dropped ammo gives 1, small pickups 2, boxes 4 rounds; backpacks give 8 (four grants of 2). Every eligible human/demon death has the same 31/256 (12.11%) drop chance. Empty guns switch to fists.

Player kills heal 15 for humans or 10 for demons, up to 100; health already above 100 stays untouched. Inherited health bonuses/spheres can reach 200. Killing any human adds aim trauma, capped at 6 for the episode, with random angular jitter proportional to trauma (TR_AIM_UNIT=16384 binary-angle units per random-byte delta per trauma). Trauma never decays. Crew cower 35 tics near visible demons within 192 units or gunfire within 512.

Fear is 0-100. Each corpse seen within 1024 units, +/-45 degrees and line of sight counts once: +1, or +2 if less than 70 tics old and closer than 256 units, identically for crew and possessed. At most 8 sight tests/tic. Fear buckets: steady <25, shaken 25-49, terrified 50-79, breaking 80-100. Hit success declines from 100% to 77/256 (30.08%); incoming damage rises linearly to 1.6x (1.0x at fear 0). Fear loses 1 after every 350 tics without new exposure and halves on level entry. Do not stare at bodies.

Halloran gives one briefing per map and rare once-per-episode beats, at least 3150 tics (90 seconds) apart. Read the Radio log for the 16KB transcript. First-time HUD hints are separate from radio. Gore, grain, weapon sway, brightness and autoaim are adjustable. Music defaults to Layered: original WAD OPL music over an audible horror score. Fear darkens and slightly lowers the OPL pitch while fear/pressure build the score. Settings offers Layered (default), Horror score, or Original; Music volume affects both layers live. Saves use Tremor 3 and browser storage; partial READ/PURGE resets on load. The inherited intermission kill percentage is combat bookkeeping, not a moral score.

## Setup and commands

Requires Node 24+ and npm. All commands run in the project root: D:\Coding VS\tremor locally, or midterms/nicoh-yay in the course checkout. PowerShell may require npm.cmd instead of npm.

```sh
# cwd: midterms/nicoh-yay
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

**[Watch the agent](public/watch.html):** with the dev server running from the
project root, open http://localhost:5191/watch.html (also linked from the title).
Replay recorded LIVE model episodes or run the careful scripted baseline with
no manual moves. Production builds serve `dist/watch.html`. Replays verify their
terminal outcome, tic, health and all metrics against the committed reports.
The original suite traces did not retain model reasons; new traces retain up to 300 characters per step. The page labels that gap explicitly.
The model recordings end by timeout, not success. This is replay evidence, not a
new live model trial. Run `npm test` (cwd: project root) for the deterministic
headless and browser-spectator replay checks.

Recording: [automated production and file details](recordings/README.md); upload link pending. Follow the
[3-5 minute recording guide](docs/RECORDING-GUIDE.md), then paste a CourseWorks-viewable
URL here and in the submission PR. Link [AGENTS.md](AGENTS.md) and the
[Codex session evidence](docs/agent-sessions/README.md) from that PR as well.

Evaluation: `npm run eval -- --players baseline_aggressive,baseline_careful --cases all` (cwd: project root).
600 actions/calls, 7 tics/action, 20s/call, five minutes/episode. Failed calls count.
Invalid actions idle for 7 tics; three invalid decisions trigger labelled wait.
Errors preserve that streak. Natural exit/death takes precedence over later limits.
Date+run ID reports: eval/results/. Raw gzip traces: eval/traces/ (ignored).
Representative traces: eval/traces-sample/. Seeds choose only an 8-bit RNG start:
17 and 273 are identical, 17 and 83 distinct; no random level generation.

Live trials require ADC credentials and GOOGLE_CLOUD_PROJECT; optional
GOOGLE_CLOUD_LOCATION defaults global. Run `npm run eval:live -- --players
model-history,model-obs-only --cases all` (cwd: project root). Both use gemini-3.5-flash-lite, K=8
versus observation-only. The full live suite ran from clean revision `8f0e4a9` on 2026-10-31.
Aggressive/careful each exited 2/14; history/observation-only each exited 0/14.
Model episode-cap timeouts: 8/7; call timeouts: 0/0; errors: 20/11.
Estimated recorded-usage costs: $4.626329/$3.339141 at the dated prices (lower bounds). [Evaluation](EVALUATION.md), [declaration](docs/EVALUATION-PLAN.md).

CI uses committed WASM; no compiler needed. Optional source rebuild needs Python
and emsdk 6.0.13: set EMSDK root / optional EMSDK_PYTHON or put emcc on PATH.

```sh
# cwd: midterms/nicoh-yay
npm run engine:wad
npm run engine:headless
npm run engine:headless:test
npm run engine:build
python engine/build/headless.py --watch
python engine/build/artifacts.py
```

engine:wad requires Pillow. Keep corresponding GPL source with binaries.
[Build](engine/BUILD.md), [contracts](docs/CONTRACTS.md), [source map](docs/rule-source-map.md),
[decisions](docs/DECISIONS.md), [five CI kinds](tests/README.md).

## Scope and changes versus Doom

Inherited: 35Hz physics, geometry, AI, keys, doors, weapons, pickups, infighting
and intermissions. Added: crew uncertainty, READ/STUN/PURGE, trauma, healing,
scarce shared rounds, corpse fear, public route guidance, sparse radio, horror
audio and clamped Y-shear freelook. This project reuses the GPL engine.
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

Personal reflections, peer notes and the course submission PR are supplied by the student.

Model prompts preserve all public map information with lossless row RLE and reverse history deltas; see [contracts](docs/CONTRACTS.md). Seen/held-out baseline comparisons concern route progress and survival; completion has only been demonstrated on E1M1.

## CI evidence

The course workflow `.github/workflows/midterm-nicoh-yay.yml` runs npm ci, npm test, npm run typecheck and npm run build. tests/agent.test.ts runs the C checks through the shipped doom-test WASM; CI needs no emsdk. Historical fork evidence only: [41244931991](https://github.com/NICOH-YAY/game-dev-f26/actions/runs/41244931991), commit c042ec0. Final course PR Actions run URL + SHA: to be added after the PR opens.

## Upstream comparison and large files

The Tremor repository is https://github.com/NICOH-YAY/tremor. Pristine vendor commit: 821957f. Final submission commit: to be filled at submission. [UPSTREAM](engine/UPSTREAM.md) gives the offline comparison recipe. [The patch](engine/tremor-vs-upstream.patch) contains changes to vendored files. Regenerate it with:

```sh
# cwd: midterms/nicoh-yay
npm run upstream:patch
```

`public/wad/freedoom1.wad` is committed so a fresh checkout can play and test offline. It is Freedoom 0.13.0, BSD-3-Clause, from https://github.com/freedoom/freedoom/releases/download/v0.13.0/freedoom-0.13.0.zip; SHA-256: 7323bcc168c5a45ff10749b339960e98314740a734c30d4b9f3337001f9e703d. Retrieve the release and extract freedoom1.wad to restore it; it is upstream data, not built here. `npm run engine:wad` (cwd: project root) rebuilds the derived tremor.wad (Python and Pillow required). `public/engine/source.zip` supplies GPL corresponding source; `npm run engine:build` (cwd: project root) recreates it and the browser engine. Committed WASM lets TAs and CI run without emsdk. The rebuild commands above recreate browser, headless and test artifacts; see [BUILD](engine/BUILD.md) for the watch target. `python engine/build/artifacts.py` (cwd: project root) refreshes the LF artifact manifest after rebuilding. `engine/doomgeneric/screenshots/sdl.png` is retained to preserve the vendor tree.

## Optional live demo

The human may run one [demo](eval/demo/README.md), labelled "demo, not part of the declared suite". It is excluded from EVALUATION tables. The 2026-11-02 live demo records 293 calls (289 engine actions), ending at the five-minute episode cap.

```sh
# cwd: midterms/nicoh-yay
npm run demo:live
npm run demo:copy
```

For step/call/timeout endings, the recorded limit reason is applied to the replay; final tic, health and all other metrics are independently reproduced from the actions.
