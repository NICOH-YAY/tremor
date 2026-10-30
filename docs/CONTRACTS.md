# Tremor worker contracts

The scaffold is original TypeScript, with no runtime dependencies. Node 24 and npm are required. Run `npm.cmd` in PowerShell if execution policy blocks `npm.ps1`. Use `npm install --cache .npm-cache` where the default cache is restricted. Commands: `npm run dev` (5191), `npm test`, `npm run typecheck`, `npm run build` (relative URLs in dist).

## Ownership and entry points

| Worker | Owned files | Entry point |
| --- | --- | --- |
| Renderer | src/render/* | `Raycaster(canvas)` implements `Renderer`; main constructs it |
| Mechanics | src/sim/enemies/*, src/sim/rules/* | default brain/hook exports registered in src/sim/registry.ts |
| Content | src/levels/*, src/audio/* | `levels` dictionary in src/levels/index.ts; `audio` implements AudioBus |
| Integrator | all other files | src/main.ts, src/player_interface.ts, src/sim/types.ts, world.ts, geometry.ts, rng.ts |

Replace existing stubs without editing registrations. For additions, append one physical registration line, e.g. `import crew from './enemies/crew'; brains.crew = crew;` or `import hangar from './hangar'; levels.hangar = hangar;`. Rules can append `import extra from './rules/extra'; rules.push(extra);`. Keep these statements after registry initialization. No worker edits shared types; coordinate necessary contract changes with the integrator. New files and bodies stay inside each worker's ownership. Tests/configuration remain integrator-owned; report proposed tests with the handoff.

## Shared data

`src/sim/types.ts` is authoritative. Coordinates, radii and velocities use tiles (velocity is tiles per tic); angles and turn commands use radians. A tic is 1/35 second. Positive angles turn toward positive Y (clockwise on the map); positive strafe moves right. Input axes accept continuous numbers and tick clamps them to [-1,1]. Every input source submits the same InputCmd. World owns all mutable simulation state, including RNG. No Date, Math.random, DOM or module-global mutable game state in mechanics. `worldRng(world)` returns [0,1) and updates rngState; brains receive this function directly.

Map cells are row-major; zero is empty, positive is wall texture ID. Doors override the underlying cell, including zero cells. Doors block when sealed or openAmount < 0.85. Player radius is 0.22; entities carry their own radius. `geometry.ts` exports blocked, canOccupy, moveCircle, rayDistance, bearing and visible. Collision is circle against grid, with axis sliding and substeps. rayDistance uses DDA. visible tests wall/door occlusion; callers apply their own field of view. Keys are map pickups with a collected flag. Triggers are once-only proximity messages. Level radio entries fire at their exact integer tic. Exit proximity ends the level. createWorld clones maps, radio and spawns, so reset never changes a LevelDef.

Player and entity fields are plain serializable data. Entity IDs start at 1 and are unique within a world; target/readTargetId references IDs. Entity data is reserved for module extension, with primitive values only. Use distinct names for additional persistent properties. Core transient flags, refreshed each tic: `reading`, `stunRequested`, `purgeRequested`. Reading refers to the nearest aimed target with line of sight; stun/purge flags refer to the aimed target. Mercy must enforce range, charges, cooldowns and state. Rules can mutate World directly and append events.

## Simulation lifecycle

tick mutates its World. Done worlds do not advance. Each tic clears events, increments tic, applies movement and cooldown, advances doors, handles use, sets target/input flags, handles firing, runs living entity brains in array order, then RuleHook.onTic in registry order. Finally it dispatches recognition transitions, radio, key pickups, proximity triggers and end conditions, then appends events to a log capped at 100 entries. The five injected rules intentionally start as no-ops; enemy stubs chase without dealing damage.

Core firing consumes ammo, sets an eight-tic cooldown, applies seeded tremor-scaled spread and finds the nearest ray/circle intersection before a wall. It emits fire/noise, calls onFire, applies 40 damage and emits hit. A lethal hit marks dead, increments crew/demon counters, emits kill and calls onKill. Possessed and crew count as crew. Temptation healing and trauma accumulation belong in onKill. Brains must not attack dead/cured entities. Mechanics that cause additional damage/kills must emit appropriate events and dispatch hooks consistently; core hooks currently cover core hitscan kills.

Recognition owns readProgress and revealed. After onTic, core detects false-to-true revealed transitions, increments player.reads, emits read and invokes every onRead hook once. Recognition must not duplicate these counters/events. Stun/purge behavior and cured/saved counts belong to Mercy. Fire events expose hitId; onFire sees targets before core damage. playerHurt events, armor handling, enemy attacks, pain, infighting and propagated noise remain mechanics work. No mortality or trauma number is displayed in the human HUD.

## Rendering and audio

Renderer.resize receives output pixel dimensions. render receives World read-only by convention, previous player position/angle, alpha in [0,1], and RenderView (shake, flash, weaponSway, recoil, bob). It must never mutate simulation or consume simulation RNG. Current Raycaster uses a 480x270 ImageData Uint32Array, DDA walls, side shading, flat floor/ceiling and billboards clipped against wall depth, then nearest-neighbor upscale. Main owns overlay HUD and crosshair drift. Preserve the exported Raycaster class/constructor or coordinate an adapter with the integrator. Main supplies zero values for effects not yet wired; renderer may derive cosmetic effects deterministically from tic/events.

Audio exports `audio: AudioBus`; main calls play with each event's type and player listener pose. AudioBus.play supports optional source position. Main currently omits source position, so spatial dispatch needs an integrator change. Handle browser audio unlock and unsupported audio gracefully inside the bus. No shipped external assets or runtime dependencies.

## Controller boundary

src/player_interface.ts exports reset, observe, legal_actions, step, outcome. Host owns World; controllers receive only observations and IDs. reset(seed, levelId) creates fresh state; invalid levels throw. observe returns detached structured data and summary, visible figures within a 120-degree field, relative bearing in degrees, distance, revealed kind or unknown figure, player supplies, keys, tremor and last five events. The human HUD never shows tremor. legal_actions returns the fixed ACTION_IDS list, or [] after completion. step mutates and returns `{state, events}`, aggregating seven tics (fewer when terminal); unknown IDs throw. Repeated fire obeys cooldown. Small turns total 35 degrees, large turns 90 degrees per macro. Outcome reports terminal flags, ticks and experiment metrics. Sim time advances only when the host ticks/steps, so an agent host needs no animation loop.

## Verification and remaining work

Scaffold validation: deterministic replay, momentum/wall collision, keyed doors, hitscan kill and occlusion, five-operation interface, all macro IDs, detached observation keys, and happy-dom boot/title smoke test. Build and strict typecheck pass. The smoke test does not exercise a real canvas or pointer lock. Renderer polish, injected rules, full enemy behavior, authored levels and audio are the parallel workers' next tasks. No parallel workers were launched during scaffold creation.
