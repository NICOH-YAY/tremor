# TREMOR

## Submission artifacts

- [Evaluation](EVALUATION.md).
- [Agent team account](AGENT-TEAM.md).
- [Primary recording (4:08), the graded recording](https://drive.google.com/file/d/1-gUtdHicrsxu483OgbBwNUdB4stBCUJH/view?usp=sharing), viewable by anyone signed in with a columbia.edu account.
- [Supplementary Gemini player recording (4:47), a close-up of the model's choices and reasons](https://drive.google.com/file/d/1rQqYeeg_dPlmrTy-UhMr5rVqtPPW869_/view?usp=sharing), the live model player on E1M1 with its reasons shown, viewable by anyone signed in with a columbia.edu account.
- [Peer notes](docs/peer-notes/README.md).
- [Agent sessions](docs/agent-sessions/README.md).
- [First independent review](docs/reviews/independent-review-2026-10-31.md) and [response](docs/reviews/review-response-2026-10-31.md); [second review](docs/reviews/review.md) and [response](docs/reviews/review-response.md); [final review](docs/reviews/review-final-2026-11-02.md) and [response](docs/reviews/review-final-response.md).
- Current evidence for the submitted head is the [course PR #67 checks page](https://github.com/columbia-university-ai-games/game-dev-f26/pull/67/checks). Earlier passing runs on this PR are [41889125996](https://github.com/columbia-university-ai-games/game-dev-f26/actions/runs/41889125996) on `95a2899` and [41892152754](https://github.com/columbia-university-ai-games/game-dev-f26/actions/runs/41892152754) on `8890302`.

The open course PR uses branch `nicoh-yay/tremor-midterm` in the course repository. GitHub detached the student fork when the course repository became private, so the branch was pushed directly to the course repository.

## Links to each part

| Part | Links |
|---|---|
| Rule sources | [Rule map](docs/rule-source-map.md#current-rulesource-map---2026-11-05), [design rationale](docs/DESIGN.md#current-design---2026-10-31) |
| Scope, omissions and adaptations | [Scope change](#scope-change), [omissions and adaptations](#original-doom-rules-omissions-and-adaptations), [first cuts](#what-i-would-cut-first) |
| Credits and licenses | [Credits and terms](#credits-and-reuse), [third-party provenance](THIRD-PARTY.md#third-party-provenance), [upstream comparison](engine/UPSTREAM.md#inspecting-the-tremor-changes) |
| Playing the game | [Goal and ending](#the-goal-and-the-ending) |
| Model player and traces | [Live traces](EVALUATION.md#representative-live-traces), [trace reasons](docs/CONTRACTS.md#trace-reasons-and-optional-demo), [replay verification](EVALUATION.md#spectator-replay-verification) |
| Hidden information and observations | [Interface contracts](docs/CONTRACTS.md#current-real-engine-contracts---2026-10-31), [information-boundary review](docs/reviews/independent-review-2026-10-30.md#1-information-boundary), [CI coverage](tests/README.md#active-ci-coverage) |
| Setup and commands | [Setup and commands](#setup-and-commands) |
| Limits and terminal reasons | [Interface and runner contracts](docs/CONTRACTS.md#current-real-engine-contracts---2026-10-31), [results and limit counts](EVALUATION.md#current-results) |
| Tests and CI | [Five check kinds](tests/README.md#active-ci-coverage), [observed regressions](tests/README.md#observed-regression-evidence), [submitted-head CI evidence](#ci-evidence) |
| Agent team and sessions | [Student team log](AGENT-TEAM.md#agent-team-log), [session evidence](docs/agent-sessions/README.md#codex-session-evidence), [independent review](docs/reviews/review.md#method) |
| Design decisions | [Decision table](docs/DECISIONS.md#current-decisions---2026-11-05), [design rationale](docs/DESIGN.md#current-design---2026-10-31) |
| Baselines and comparison | [Declared plan](docs/EVALUATION-PLAN.md#declaration-timeline-read-first), [player decisions](docs/DECISIONS.md#current-decisions---2026-11-05), [interpretation](EVALUATION.md#what-the-experiment-shows) |
| Results | [Results table](EVALUATION.md#current-results), [version identifiers](EVALUATION.md#evaluated-and-submitted-versions) |
| Evaluation plan and timeline | [Declaration timeline](docs/EVALUATION-PLAN.md#declaration-timeline-read-first), [baseline reproduction](docs/EVALUATION-PLAN.md#baseline-reproduction-evidence), [results](EVALUATION.md#current-results) |
| Held-out cases | [Declaration timeline](docs/EVALUATION-PLAN.md#declaration-timeline-read-first), [split results](EVALUATION.md#current-results), [limitations](EVALUATION.md#known-limitations-facts) |
| Search-based solver | [Supplementary solver and measured limits](EVALUATION.md#supplementary-automated-solver-added-2026-11-05), [solver command and approach](#setup-and-commands) |
| Costs and failures | [Cost and failure accounting](EVALUATION.md#current-results), [accounting limitations](EVALUATION.md#known-limitations-facts) |
| Limitations | [Student limitations](EVALUATION.md#limitations-in-nicohs-words), [known limitations](EVALUATION.md#known-limitations-facts) |
| Human playtests | [Human playtest notes](docs/playtests/README.md#human-playtests-anonymous) |
| Recordings | [Primary recording](https://drive.google.com/file/d/1-gUtdHicrsxu483OgbBwNUdB4stBCUJH/view?usp=sharing), [supplementary recording](https://drive.google.com/file/d/1rQqYeeg_dPlmrTy-UhMr5rVqtPPW869_/view?usp=sharing), [primary recording details](recordings/README.md#automated-tremor-recording), [supplementary recording details](recordings/README.md#gemini-only-recording--2026-11-04) |
| Peer notes | [Peer requirements and status](docs/peer-notes/README.md#peer-playtest-notes), [reply template](docs/peer-notes/README.md#given-blank-template-for-nov-16-notes) |
| Codex instructions | [Codex instructions](AGENTS.md#tremor-ownership) |
| Reusable skill | [Skill account](AGENT-TEAM.md#reusable-skills), [invocation records](docs/SKILL-INVOCATIONS.md#skill-invocations) |
| Independent reviews | [Review method](docs/reviews/review.md#method), [findings](docs/reviews/review.md#findings), [final review](docs/reviews/review-final-2026-11-02.md#method) |

## Scope change

The Week 3 scope record was Robotron: 2084 (Williams, 1982), waves 1-4. No license was found for its source. On 2026-10-30 the project moved to Doom Episode 1 because the GPL engine permits reuse. The retired TypeScript prototype is in legacy/. See [Original Doom rules, omissions and adaptations](#original-doom-rules-omissions-and-adaptations) for the included rules, exclusions, adaptations and what I would cut first.

Reference game: Doom (id Software, 1993), Episode 1 'Knee-Deep in the Dead', played here on Freedoom Phase 1 v0.13.0 data; no proprietary IWAD shipped.

## Specification at a glance

The human episode runs through Episode 1 to the E1M8 finale. The course API resets one Freedoom E1Mx map with reset(seed), skill index 2, a pistol start, hostile count +1 rounds, zero trauma and initially steady terror. The seed selects an 8-bit RNG start. There are 40 constant action IDs with validation feedback. Each action advances seven tics; compound macros hold their named controls. READ and PURGE require 35 continuous tics. Exit scores 100; all other endings score 0. Moral metrics are descriptive. Termination reasons are exit, dead, step_limit (600), call_limit (600), or timeout (20 seconds per call, five minutes per episode). See [contracts](docs/CONTRACTS.md) for the five operations and invalid-action policy.

The current rule map is [docs/rule-source-map.md](docs/rule-source-map.md). Superseded specifications and maps are history only.



## Setup and commands

```sh
# cwd: any
git clone https://github.com/columbia-university-ai-games/game-dev-f26.git
cd game-dev-f26
git checkout nicoh-yay/tremor-midterm
# TA: confirm git rev-parse HEAD matches the head commit shown on PR #67.
cd midterms/nicoh-yay
```

Requires Node 24+ and npm. All following commands run in midterms/nicoh-yay in the course checkout. PowerShell may require npm.cmd instead of npm.

### Play

Leave the dev server running in its own terminal and open the printed localhost URL.

```sh
# cwd: midterms/nicoh-yay
npm ci
npm run dev
```

### Verify

Run these commands in a second terminal.

```sh
# cwd: midterms/nicoh-yay
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
midterms/nicoh-yay, open http://localhost:5191/watch.html (also linked from the title).
Replay recorded LIVE model episodes or run the careful scripted baseline with
no manual moves. Production builds serve `dist/watch.html`. Replays verify their
terminal outcome, tic, health and all metrics against the committed reports.
The original suite traces did not retain model reasons; new traces retain up to 300 characters per step. The page labels that gap explicitly.
The model recordings end by timeout, not success. This is replay evidence, not a
new live model trial. Run `npm test` (cwd: midterms/nicoh-yay) for the deterministic
headless and browser-spectator replay checks.

The [Primary recording (4:08), the graded recording](https://drive.google.com/file/d/1-gUtdHicrsxu483OgbBwNUdB4stBCUJH/view?usp=sharing) is available to anyone signed in with a columbia.edu account.
The [Supplementary Gemini player recording (4:47), a close-up of the model's choices and reasons](https://drive.google.com/file/d/1rQqYeeg_dPlmrTy-UhMr5rVqtPPW869_/view?usp=sharing) shows the evaluated model player and is available to the same accounts.
The video lasts about 4 minutes 8 seconds and shows the title and rules, a replay of the live Gemini model-history agent playing E1M1 with no manual input until its five-minute episode cap, the baseline_careful run reaching the exit, the results table and limitations.
See [automated production and file details](recordings/README.md) and the
[recording guide](docs/RECORDING-GUIDE.md).

Evaluation: `npm run eval -- --players baseline_aggressive,baseline_careful --cases all` (cwd: midterms/nicoh-yay).
600 actions/calls, 7 tics/action, 20s/call, five minutes/episode. Failed calls count.
Invalid actions idle for 7 tics; three invalid decisions trigger labelled wait.
Errors preserve that streak. Natural exit/death takes precedence over later limits.
Date+run ID reports: eval/results/. Raw gzip traces: eval/traces/ (ignored).
Representative traces: eval/traces-sample/. Seeds choose only an 8-bit RNG start:
17 and 273 are identical, 17 and 83 distinct; no random level generation.

Supplementary solver run:

```sh
# cwd: midterms/nicoh-yay
npm run eval -- --players baseline_solver --cases all
```

For this single-player game the automated players are the two scripted baselines plus this search-based solver, offered for the brief's solver line. It finished 0 of 14 maps. A complete optimal solver for real-time 3D Doom with moving, random monsters is not feasible in this scope, so the solver plans routes over the public map and reacts to visible threats. It is supplementary to the declared comparison; its measured results are in [Evaluation](EVALUATION.md#supplementary-automated-solver-added-2026-11-05).

Technical. `src/agent/solver.ts` rebuilds a grid from public automap rows each step and runs deterministic BFS with at most 4096 discovered/expanded cells toward the public route waypoint, including its key/door dependencies. It converts a short path segment to constant macro actions, uses doors, reads unknown figures before firing at confirmed hostiles, and backs away from nearby threats below 30 health. Unmapped targets fall back to public guidance. The unchanged runner passes only detached public Observation, copied legal IDs and validation feedback, never the private WASM handle, WAD files, evaluator outcome or hidden crew identity. This preserves check 2c's information boundary; in-process controller imports are not a security sandbox. The same limits and normal traces and terminal reasons apply.

Live trials require ADC credentials and GOOGLE_CLOUD_PROJECT; optional
GOOGLE_CLOUD_LOCATION defaults global. Run `npm run eval:live -- --players
model-history,model-obs-only --cases all` (cwd: midterms/nicoh-yay). Both use gemini-3.5-flash-lite, K=8
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

## How Tremor works

The authoritative versions are [docs/RULES.md](docs/RULES.md) and [docs/rule-source-map.md](docs/rule-source-map.md). [Contracts](docs/CONTRACTS.md) define the public agent interface. Each technical paragraph names the relevant rule/source-map rows and classification labels.

### The goal and the ending

Find the exit and survive to continue through Episode 1. The human episode finishes at the final level, with an optional secret level along the way. If you die, you can restart the level.

Technical. The browser episode ends at E1M8; E1M9 is optional. An agent episode resets a single E1M1-E1M9 map and ends on exit, death or an evaluator limit. Rule/source-map rows: **Keys/exits/hazards** (`code`), **Controls/player manual** and **Runner** (`design`). Locators: `engine/doomgeneric/doomgeneric/g_game.c` (`G_DoCompleted`), `p_switch.c` (`P_UseSpecialLine`), `p_spec.c` (`P_CrossSpecialLine`, `P_PlayerInSpecialSector`), and `engine/tremor/agent_api.c` (terminal detection).

### Controls

Move with WASD and turn with the mouse or arrow keys. Look up or down with mouse movement or PgUp/PgDn, fire with Ctrl or click, and use doors or switches with E or Space. Hold TAB for the route map and press ? to pause for help. Settings let you rebind controls.

Technical. End centers the view; Shift runs; 1-7 select weapons; R/right mouse holds READ, F uses STUN, and Q holds PURGE. Pitch clamps to +/-32 degrees using Y-shear; aimed interactions follow pitch like shots. Fists apply `TR_MELEE_MULTIPLIER=10` to inherited fist damage. Rule/source-map rows: **Controls/player manual**, **Pitch**, **TR_MELEE_MULTIPLIER** (`design`), **Movement/collision** (`code`). Locators: `index.html` (`how-to-play`), `engine/tremor/tremor.h`, `tremor.c` (`TR_PlayerThink`, `TR_PitchSlope`, `tremor_bind_key`), and `engine/doomgeneric/doomgeneric/g_game.c` (`G_BuildTiccmd`).

### Fear

Seeing bodies raises your fear, especially when a death is recent and close. Keep moving and give yourself time away from new bodies to recover. Some fear follows you into the next level.

Technical. Fear is clamped to 0-100. Each corpse counts once within 1024 units, +/-45 degrees and line of sight: +1, or +2 when its recorded death is less than 70 tics old and its distance is less than 256 units. Crew and possessed corpses use the same rule. `TR_TERROR_SCAN=8` caps sight tests per tic; `TR_TERROR_DECAY=350` removes 1 point after each such interval without new exposure; level entry halves fear with integer division. Timing is 35 tics/second. Rule/source-map rows: **Fear**, **Decay/carry**, **TR_TERROR_RANGE**, **TR_TERROR_CLOSE**, **TR_TERROR_SCAN**, **TR_TERROR_DECAY** (`design`), **Timing** (`code`). Locators: `engine/tremor/tremor.h`, `tremor.c` (`corpses`, `TR_LevelStart`), and `engine/doomgeneric/doomgeneric/doomdef.h` (`TICRATE`).

### What fear does to you

As fear rises, your shots become less reliable and attacks hurt more. Your weapon sways, the screen edges darken, and you hear a faster heartbeat. Moving away from new bodies helps you recover before the next fight.

Technical. `TR_Hit` succeeds when a random byte is less than `256 - fear * 179 / 100`, using integer division (`TR_HIT_LOSS=179`): 100% at zero fear, 77/256 or 30.08% at maximum fear, approximately 30%. This is the fear hit roll; aim and trauma also affect final accuracy. `TR_Damage(d)` returns `d + (d * fear * 6) / 1000` (`TR_DAMAGE_EXTRA=6`), reaching x1.6 before integer rounding. Buckets are steady <25, shaken <50, terrified <80, otherwise breaking. Rule/source-map rows: **Fear effects**, **TR_HIT_LOSS**, **TR_DAMAGE_EXTRA**, **UI/effects** (`design`). Locators: `engine/tremor/tremor.c` (`TR_Hit`, `TR_Aim`, `TR_Damage`, `TR_TerrorBucket`, `TR_Sway`, `TR_ArmY`) and `public/horror.js` (`frame`, fear-driven shade and heartbeat). Sway, grain, brightness and autoaim are adjustable.

### Ammo

All guns draw from the same supply of rounds. You begin each level with only a little more ammunition than the number of hostiles, so avoid wasting shots. Pickups and death drops are scarce; completing a purge gives you more rounds. Empty guns switch to fists.

Technical. `TR_LevelStart` sets rounds to `totalkills + 1` and resets weapons to fists/pistol; this public budget deliberately reveals the starting hostile count. Weapon pickups add no rounds. `TR_AMMO_KEEP=64` retains map ammo with probability 64/256; `TR_AMMO_DROP=31` gives every eligible human/demon death the same 31/256 chance of dropping 1 round. Small pickups grant 2, boxes 4, backpacks 8 through four grants of 2, and completed purges grant 3. Rule/source-map rows: **Ammo**, **TR_AMMO_KEEP**, **TR_AMMO_DROP**, **Purge** (`design`). Locators: `engine/tremor/tremor.h`, `tremor.c` (`TR_LevelStart`, `TR_Kill`, `TR_Ammo`, `TR_PlayerThink`, `TR_CheckAmmo`) and `engine/doomgeneric/doomgeneric/p_inter.c` (`P_GiveAmmo`, `P_GiveWeapon`, `P_TouchSpecialThing`).

### The crew and the moral choice

An unfamiliar human figure may be crew or possessed. Hold READ while aiming to learn who they are before deciding whether to shoot. Stun a figure and hold PURGE close to them to cure possession, but staying close takes time and leaves you exposed. Identity stays hidden so you must choose whether to spend that time before firing.

Technical. `TR_CREW_THRESHOLD=90` gives pistol/shotgun humans a 90/256 crew spawn probability; crew never attack. READ needs 35 continuous tics. STUN reaches 64 units (`MELEERANGE`), lasts 70 tics and has a 35-tic cooldown. PURGE needs 35 uninterrupted tics within that range on a stunned human; damage, losing aim, release or stun expiry interrupts it. Completion spends 1 of 2 per-level charges, grants 3 rounds and reveals either identity as crew; only curing possession increments saved crew. Repeating a crew purge still costs a charge. Unread public figures have no identity IDs; stun and interrupted-purge feedback match identities. Killing any human adds permanent episode trauma, capped at 6, with jitter `(P_Random()-P_Random()) * trauma * TR_AIM_UNIT`, where `TR_AIM_UNIT=16384` binary-angle units. Player kills heal 15 for humans or 10 for demons up to 100, leaving health already above 100 untouched; inherited bonuses/spheres can reach 200. Crew cower for 35 tics near visible demons within 192 units or gunfire within 512 units. Rule/source-map rows: **Crew probability**, **TR_READ_TICS**, **TR_STUN_TICS**, **TR_STUN_COOLDOWN**, **TR_PURGE_TICS**, **TR_PURGE_CHARGES**, **Purge**, **Kill effects**, **TR_AIM_UNIT**, **TR_FEAR_RANGE**, **TR_GUN_FEAR_RANGE**, **TR_COWER_TICS** (`design`), **Health/armor** (`code`). Locators: `engine/tremor/tremor.h`, `tremor.c` (`TR_MapSpawn`, `TR_Think`, `TR_PlayerThink`, `TR_Damaged`, `TR_Kill`, `TR_Aim`, `TR_Noise`), `engine/tremor/agent_api.c` (entity serialization), and `engine/doomgeneric/doomgeneric/p_local.h` (`MELEERANGE`).

### The radio voice

Halloran briefs you when you enter a level and speaks occasionally as you play. Read the Radio log if you miss a line. First-time control hints appear separately so you can learn without waiting for the radio.

Technical. Each map briefing is queued once per episode via `tr_briefing_bits`; rare Halloran beats are also once per episode, separated by at least `TR_RADIO_COOLDOWN=3150` tics (90 seconds), with level start resetting the cooldown clock. The transcript buffer is 16384 bytes. Purge completion also queues a separate crew ammunition acknowledgment. Rule/source-map rows: **Radio/save**, **TR_RADIO_COOLDOWN** (`design`). Locators: `engine/tremor/tremor.h`, `tremor.c` (`TR_StoryStart`, `TR_Radio`, `TR_QueueRadio`, `TR_PlayerThink`, `hint_once`). Music defaults to Layered, combining original WAD OPL music and the horror score; Settings also offers Horror score or Original, with live volume control for both layers. Fear darkens and slightly lowers the OPL pitch while fear and pressure build the score (`public/horror.js`, `public/music.js`; **UI/effects**, `design`). Tremor 3 browser saves preserve state but reset partial READ/PURGE channels (`engine/doomgeneric/doomgeneric/p_saveg.c`; **Radio/save**, `design`).

### Objectives and the route map

Follow the current objective toward a key, switch or exit. Hold TAB for the map and direction arrow when you need help finding the route. The guidance can show where to go before you have explored the area, but it does not solve every lift or teleporter.

Technical. Human TAB and agents share full-geometry guidance, including unseen dependencies; secret lines block the route lattice. The lattice uses 16-unit cells and a smoothed waypoint up to 256 units ahead. Objective distance is near below 128 units, nearby below 512, otherwise far. The public north-up automap is 257x257 cells at 16 units/cell, with D/d doors, S switches, T crossings and b/y/r locks; no secret activation markers or actor identities leave the planner. Rule/source-map rows: **Map**, **Route** (`design`). Locators: `engine/tremor/tremor.c` (`TR_StoryTick`, `route_update`, `TR_ObjectiveBearing`, `TR_ObjectiveDistance`), `engine/tremor/agent_api.c` (`automap`, `discover`), and `engine/doomgeneric/doomgeneric/am_map.c` (`AM_drawWalls`).

### Scoring and what is measured

Reaching the exit is the scored goal. The evaluation also records how you treated the crew and how far you progressed, so a result can describe more than survival. These records do not turn crew deaths or rescues into extra score.

Technical. Exit scores 100; every other ending scores 0. Outcomes record crew killed/saved, reads, fired-unread, kills, rounds left, trauma, terror bucket, tics and final health. Evaluator-only route progress is a sector-hop proxy clamped to 0-99 until exit gives 100; it ignores locks/heights and does not prove traversability. `objectivesReached` counts distinct key types collected plus completed exit, not switch-only subtasks. Moral metrics are descriptive; the inherited intermission kill percentage is combat bookkeeping. Rule/source-map row: **Runner** (`design`); contracts define outcome and progress fields. Locators: `engine/tremor/agent_api.c` (`route_progress`, `tremor_agent_outcome`) and `src/eval/runner.ts` (`runEpisode`).

### The agent interface

An agent receives a text description of what the player can know and chooses a short action. It can move, fight, read figures and follow the same route guidance as a human. It receives no game image or sound, and hidden identities remain hidden until revealed through play.

Technical. The five operations are `reset`, `observe`, `legal_actions`, `step` and `outcome` in `src/player_interface.ts`. Controllers receive detached public Observation data, copied legal IDs and validation feedback, never the private WASM handle or evaluator outcome; imports are not a security sandbox. There are 40 constant actions, each advancing 7 tics (0.2 seconds); compound macros hold both controls. Reset uses skill index 2 and `seed & 255` for an 8-bit RNG start, not generated levels. Limits are 600 actions, 600 calls, 20 seconds/call and 300 seconds/episode. Invalid submissions idle for 7 tics; three invalid decisions trigger a labelled wait, with errors preserving that streak. Failed calls consume call budget without advancing gameplay. Natural exit/death takes precedence over later limits; terminal actions do not advance. Rule/source-map section: **40-action ABI**; row: **Runner** (`design`); contracts define public boundaries. Locators: `engine/tremor/agent_api.c` (`tremor_agent_step`), `src/agent/actions.ts` (`ACTION_IDS`), `src/player_interface.ts`, and `src/eval/runner.ts` (`runEpisode`).

### How the evaluation works

The declared suite compares aggressive and careful scripted players with Gemini playing from the same public information. One Gemini condition receives recent history and the other receives only the current observation. Read [EVALUATION.md](EVALUATION.md) for the results, failures and limitations; the recorded trials do not demonstrate model completion.

Technical. The [declared plan](docs/EVALUATION-PLAN.md) separates tuning E1M1-E1M3, seen E1M4-E1M5 and held-out E1M6-E1M7, each with RNG starts 17 and 83. Four players produce 56 episodes: `baseline_aggressive`, `baseline_careful`, and `gemini-3.5-flash-lite` with K=8 history or observation-only. The declared live run dated 2026-10-31 reports 2/14 exits for each baseline and 0/14 for each Gemini condition; only scripted E1M1 runs exited. These are recorded observations, not guarantees. Rule/source-map rows: **Runner**, **Model encoding** (`design`); results are evidence in EVALUATION.md. Locators: `src/eval/runner.ts` (`runEpisode`), `src/eval/model_config.ts`, `src/agent/prompt.ts`, and the plan/result links in EVALUATION.md. Live evaluation requires `--live`; replay and the optional demo are excluded from declared-suite results.

## Original Doom rules, omissions and adaptations

### What original Doom Episode 1 is

Doom is a first-person shooter: you see through the player's eyes, navigate rooms, fight enemies and find an exit switch. Episode 1 is "Knee-Deep in the Dead". Keycards unlock doors; weapons, ammunition, health and armor are collected by walking over them. Monsters pursue and attack, and can fight each other after friendly fire. Intermissions separate maps. Death ends the current attempt; humans can restart.

Technical. **Timing**, **Movement/collision**, **Weapons/missiles/AI**, **Health/armor**, **Keys/exits/hazards** are inherited (`code` in the [rule map](docs/rule-source-map.md)). Unchanged foundations include 35Hz movement/collision, door/key/exit logic, ordinary pickup benefits, monster state tables, infighting, intermissions and no jumping, as in the original; Tremor's combat changes follow below. In `engine/doomgeneric/doomgeneric/`: `p_enemy.c` (`A_Chase`), `p_inter.c` (`P_DamageMobj`, `P_TouchSpecialThing`), `p_doors.c` (`EV_DoLockedDoor`), `g_game.c` (`G_DoCompleted`); agent death: `engine/tremor/agent_api.c` (`check_terminal`, design).

The shipped maps and art are Freedoom Phase 1's own levels and images standing in for id's, not reproductions of id's layouts.

Technical. **Freedoom-for-Doom data** (`assumed`) means equivalent engine rules, not identical content: v0.13.0, BSD-3-Clause; [provenance](engine/UPSTREAM.md), [license](public/wad/FREEDOOM-LICENSE.txt).

### What was left out, and why

Other episodes and Doom II are outside the project scope. The brief asks for one bounded portion of the reference game, so the project reproduces Episode 1 only.

Technical. **Runner** (`design`): `src/player_interface.ts` (`reset`) accepts E1M1-E1M9 only and loads bundled data; `engine/tremor/agent_api.c` (`tremor_agent_reset`) starts single-player with `freedoom1.wad` and `tremor.wad`. See [evaluation scope](docs/EVALUATION-PLAN.md).

Multiplayer and deathmatch are outside the bounded Episode 1 scope. The course interface and evaluation are single-player.

Technical. **Runner** (`design`): `engine/tremor/agent_api.c` (`tremor_agent_reset`, single-player startup); [evaluation scope](docs/EVALUATION-PLAN.md).

Arbitrary add-on PWADs are outside evaluation to keep the scope bounded to Episode 1, as the brief asks.

Technical. **Runner** (`design`): `src/player_interface.ts` (`reset`) loads bundled `freedoom1.wad` and `tremor.wad`; [evaluation scope](docs/EVALUATION-PLAN.md).

The suite plays E1M1-E1M7. Humans can reach optional secret E1M9 and the E1M8 finale. Neither is human-only in the API. E1M8 is a short boss finale and E1M9 is a secret level reachable only through a secret exit. The seven regular maps give a comparable set of levels and keep the run count affordable.

Technical. **Keys/exits/hazards** (inherited), **Runner** (`design`): `g_game.c` (`G_DoCompleted`) routes secret exits to E1M9 and ends at E1M8; `src/eval/suite.ts` (`SUITE`), `src/player_interface.ts` (`reset`); [rules](docs/RULES.md).

Proprietary id IWAD data is omitted for licensing.

Technical. **Freedoom-for-Doom data** (`assumed`): [provenance](engine/UPSTREAM.md).

Original Doom has no vertical look. Tremor adds clamped vertical freelook using compatible vertical shearing in the software renderer. True 3D freelook is a limit of this addition.

Technical. **Pitch** (`design`): [renderer decision](docs/DECISIONS.md), `engine/tremor/tremor.c` (`TR_PitchSlope`).

Evaluation fixes difficulty at skill index 2 and gives agents text observations, including an automap, with no pixels or audio. This makes a fair comparison: every evaluated player gets the same difficulty and the same information. Save/load, cheats and browser menus are not in the 40-action set.

Technical. **Runner**, **Map** (`design`): `src/player_interface.ts` (`reset`, fixed skill index 2), `src/agent/actions.ts` (`ACTION_IDS`), `engine/tremor/agent_api.c` (`automap`, `tremor_agent_observe`, headless `-nosound`); [contracts](docs/CONTRACTS.md).

### What was changed or added, and why

Crew uncertainty makes shooting a moral choice. READ trades exposure for knowledge; STUN and PURGE permit rescue but demand time and limited resources.

Technical. **Crew probability**, **Purge** (`design`): `engine/tremor/tremor.h` and `tremor.c` (`TR_PlayerThink`): crew 90/256, READ/PURGE 35 tics, STUN 70, two purge charges; [rationale](docs/DESIGN.md).

Scarce shared rounds reward exploration and mercy. Human kills cause lasting aim trauma but heal more, tempting violence. Corpse fear makes attention and retreat matter, reducing shot reliability and increasing damage received.

Technical. **Ammo**, **Kill effects**, **Fear effects** (`design`): `tremor.c` (`TR_LevelStart`, `TR_Kill`, `TR_Aim`, `TR_Hit`, `TR_Damage`): hostile count+1 rounds; healing 15/10 capped at 100; trauma cap 6; fear 0-100; [rationale](docs/DESIGN.md).

Sparse radio leaves combat audible. Layered horror audio adds tension while retaining the original music. Recoloured sprites give monsters a horror palette that matches the game's tone.

Technical. **Radio/save**, **UI/effects** (`design`): `tremor.c` (`TR_Radio`, 3150-tic cooldown), `public/horror.js`, `public/music.js`; `scripts/build-tremor-wad.py` (`build`); [design](docs/DESIGN.md), [decisions](docs/DECISIONS.md).

Clamped freelook supports vertical targets. Public route guidance helps humans and agents equally but is not a universal lift/teleporter solver. Native resolution preserves the classic image while limiting browser work.

Technical. **Pitch**, **Route**, **UI/effects** (`design`): `tremor.c` (`TR_PitchSlope`, +/-32 degrees; `route_update`, 16-unit lattice), `public/engine-page.js` (320x200 displayed at 4:3); [rationale](docs/DESIGN.md).

A turn-based wrapper lets an agent deliberate between short bursts of real-time play, preserving engine timing while bounding calls. The retired TS raycaster is in legacy/, excluded from tests/build; historical wins are not engine evidence.

Technical. **Runner**, **40-action ABI** (`design`): `agent_api.c` (`STEP_TICS=7`), `src/agent/actions.ts` (`ACTION_IDS`, 40 constant macros), `src/eval/runner.ts` (`runEpisode`, 600 steps/calls, 20s/call, 300s total); text: `tremor_agent_observe`; [decisions](docs/DECISIONS.md), `vite.config.ts`, `tsconfig.json`.

### What I would cut first

If time ran out, the first things to cut would be the presentation extras: the layered horror audio, the recoloured sprites and the radio voice. The next cut would be fewer levels in the suite, down to the three-situation minimum. The crew uncertainty, scarce ammo, fear and trauma mechanics and the agent interface stay, because they are the core of the game and the experiment.

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
claim in generated art. [Art provenance](public/art/CREDITS.md). The art in public/art was generated by Nicoh with Higgsfield (model z_image) on 2026-10-30 and is disclosed as AI-generated. Higgsfield's Terms of Use Agreement, Section 4.4 (last updated October 23, 2026, accessed 2026-11-05), states that Higgsfield "does not claim ownership of any of your Inputs or Outputs, nor does it restrict your commercial use of Outputs." Its help page states "The Terms of Use do not require attribution for outputs." Sources: [Terms of Use Agreement](https://higgsfield.ai/terms-of-use-agreement) and [Who owns my generations](https://higgsfield.ai/creator-hub/help-center/account/who-owns-my-generations-and-can-i-use-them-commercially). The full record, including watermark and provenance terms, is in [art credits](public/art/CREDITS.md).
Nuked OPL3 is LGPL-2.1-or-later with source/relink inputs shipped.
[Third-party table](THIRD-PARTY.md). Phobos/UAC are descriptive; no affiliation
with id Software or ZeniMax. Proprietary Doom WADs do not ship.

Personal reflections, peer notes and the course submission PR are supplied by the student.

Model prompts preserve all public map information with lossless row RLE and reverse history deltas; see [contracts](docs/CONTRACTS.md). Seen/held-out baseline comparisons concern route progress and survival; completion has only been demonstrated on E1M1.

## Contributors

Nicoh wrote AGENT-TEAM.md, the limitations paragraph and the playtest notes. Claude made small accuracy edits to five passages at Nicoh's request (the skills paragraph, the first two limitations points and one sentence about what the Gemini player sees, and one note in the playtest notes about which build was played). The README, rules docs and evaluation report were written by Codex and Claude from Nicoh's design, playtests and decisions, and he directed and reviewed them.

- **Nicoh**: design, direction and playtesting. [AGENT-TEAM.md](AGENT-TEAM.md) and the [evaluation limitations](EVALUATION.md#limitations-in-nicohs-words) describe his decisions and limitations in his own words.
- **Codex (OpenAI)**: the only code editor, responsible for all original game, engine patch, agent, evaluation and tooling code in the current engine-based Tremor. The retired TypeScript prototype in legacy/ was partly built by Claude worker agents, as recorded in the 2026-10-30 "Three Claude Sonnet worker subagents in parallel" row of the [agent capability table](docs/agent-sessions/README.md#agent-capabilities), including renderer commit `14860bd`. The inherited engine and third-party assets retain their upstream authorship. See [ownership instructions](AGENTS.md) and [per-session evidence](docs/agent-sessions/README.md).
- **Claude Code (Anthropic)**: planning, prompts, review coordination, browser playtests, commits and evaluation runs.
- **Independent reviewer and audit agents**: reviews and checks recorded in [docs/reviews/](docs/reviews/).
- **Gemini 3.5 Flash-Lite**: the evaluated player, not a builder.

Commits since 2026-11-04 carry `Co-authored-by` trailers for Codex and Claude. Earlier Codex work is recorded per session in [docs/agent-sessions/README.md](docs/agent-sessions/README.md).

## CI evidence

The course workflow `.github/workflows/midterm-nicoh-yay.yml` runs npm ci, npm test, npm run typecheck and npm run build. tests/agent.test.ts runs the C checks through the shipped doom-test WASM; CI needs no emsdk. Historical fork evidence is [41244931991](https://github.com/NICOH-YAY/game-dev-f26/actions/runs/41244931991), commit c042ec0. This earlier run is not final-version CI evidence. Current evidence for the submitted head is the [course PR #67 checks page](https://github.com/columbia-university-ai-games/game-dev-f26/pull/67/checks). Earlier passing runs on this PR are [41889125996](https://github.com/columbia-university-ai-games/game-dev-f26/actions/runs/41889125996) on `95a2899` and [41892152754](https://github.com/columbia-university-ai-games/game-dev-f26/actions/runs/41892152754) on `8890302`.

## Upstream comparison and large files

The Tremor repository is https://github.com/NICOH-YAY/tremor. The pristine vendor commit is `821957f`. The course folder is synced from the current Tremor main at each PR push. The [course PR #67 checks page](https://github.com/columbia-university-ai-games/game-dev-f26/pull/67/checks) is the CI evidence for the submitted head. Changes after `9e06475` include documentation, recording tooling and the supplementary solver. [UPSTREAM](engine/UPSTREAM.md) gives the offline comparison recipe. [The patch](engine/tremor-vs-upstream.patch) contains changes to vendored files. Regenerate it with:

```sh
# cwd: midterms/nicoh-yay
npm run upstream:patch
```

`public/wad/freedoom1.wad` is committed so a fresh checkout can play and test offline. It is Freedoom 0.13.0, BSD-3-Clause, from https://github.com/freedoom/freedoom/releases/download/v0.13.0/freedoom-0.13.0.zip; SHA-256: 7323bcc168c5a45ff10749b339960e98314740a734c30d4b9f3337001f9e703d. Retrieve the release and extract freedoom1.wad to restore it; it is upstream data, not built here. `npm run engine:wad` (cwd: midterms/nicoh-yay) rebuilds the derived tremor.wad (Python and Pillow required). `public/engine/source.zip` supplies GPL corresponding source; `npm run engine:build` (cwd: midterms/nicoh-yay) recreates it and the browser engine. Committed WASM lets TAs and CI run without emsdk. The rebuild commands above recreate browser, headless and test artifacts; see [BUILD](engine/BUILD.md) for the watch target. `python engine/build/artifacts.py` (cwd: midterms/nicoh-yay) refreshes the LF artifact manifest after rebuilding. `engine/doomgeneric/screenshots/sdl.png` is retained to preserve the vendor tree.

## Optional live demo

The human may run one [demo](eval/demo/README.md), labelled "demo, not part of the declared suite". It is excluded from EVALUATION tables. The 2026-11-02 live demo records 293 calls (289 engine actions), ending at the five-minute episode cap.

```sh
# cwd: midterms/nicoh-yay
npm run demo:live
npm run demo:copy
```

For step/call/timeout endings, the recorded limit reason is applied to the replay; final tic, health and all other metrics are independently reproduced from the actions.
