# Tremor: design brief

The browser entry point now runs the real vendored Doom engine with original Tremor patches. `engine/PATCHES.md` and `engine/tremor/tremor.h` describe the active implementation and constants. The TypeScript prototype below is retained for agent experiments; its custom levels, enemies, collar mechanic and timing adaptations are not used by the browser Doom mod. The loaded IWAD supplies browser maps, enemies, weapons, sounds and episode finales.

Creative Director: Nicoh. A reconstruction of **Doom (id Software, 1993)**, rebuilt from scratch in TypeScript as a 2D-canvas raycaster. No id code, art, sound, music or level layouts are shipped. Doom's rules (35 Hz tic rate, hitscan vs projectile enemies, keycards, monster infighting, pain chance, sound propagation) are reconstructed and each one is mapped to the original source in `docs/rule-source-map.md` (linuxdoom-1.10, GPL release; cited, not copied).

## Pillar
The loop is Doom's: aim, shoot, survive. Meaning comes from the dissonance between that ultraviolence and a constraint injected into it, not from story. **The gun works perfectly. The person holding it doesn't.** Precedents: Hideous Destructor (realism and fragility), Total Chaos (disempowerment total conversion). Inspiration only.

## Injected rules
1. **Recognition.** Infected crew ("Possessed") and demons are hard to tell apart at range or in darkness. Holding the crosshair on a target for ~1 s (35 tics) *reads* it and reveals what it is. Firing unread is always allowed.
2. **Trauma.** Each crew member killed adds a permanent aim tremor (crosshair drift and spread) for the rest of the run. Demons add none. There is no score or meter: the body carries it.
3. **Temptation.** Kills restore a little health (a power-fantasy reward). Saving costs time and health.
4. **Mercy tool.** A Possessed can be stunned (melee/stun shot) and then purged at close range with a scarce purge charge, curing them. Saved crew may later help (open a door, warn of ambush) or relapse (seeded).
5. **Noise.** Gunfire alerts monsters through connected sectors (Doom's P_NoiseAlert). Sneaking avoids fights.
6. No morality score, praise or judgement screen. A short end-of-level line reflects what happened, plainly.

## Enemies (original names/art)
- **Possessed** (Doom zombieman role): hitscan, curable, shows tells (flicker, hesitation) when read.
- **Ember** (imp role): slow dodgeable fireball, flees when alone, returns to its nest.
- **Hound** (pinky role): melee charger wearing a company shock collar; shooting the collar frees it and it fights other demons (infighting).

## Levels
1. **Hangar: Outbreak.** Teaches movement, shooting, recognition, stun/purge. Red keycard.
2. **Quarantine Wing: Orders.** Radio orders escalate ("seal the door" -> "survivors inside, seal it anyway"). The blue keycard lies on the floor beside a wounded survivor. Shared medkits.

## Feel
Fast Doom movement with momentum and friction, strafing, mouse look via pointer lock (keyboard turning fallback), head bob, weapon sway and recoil, muzzle flash lighting, screen shake, hit flashes, distance fog, textured walls, floor/ceiling casting, billboarded sprites. Fixed-step deterministic sim at 35 Hz with interpolated rendering at display refresh. Internal render ~480x270, upscaled pixel-crisp. Must hold 60 FPS on CPU-only Canvas 2D (no WebGL: the target browser has no GPU acceleration).

## Agent
The game is wrapped in the course's five operations (reset / observe / legal_actions / step / outcome). The agent plays **tick-paused**: the sim freezes while it decides. Observations are structured text (visible entities with bearing/distance/read-state, health, ammo, purge charges, qualitative aim, keys, last events). Actions are discrete macros (turn_left/right small/large, forward/back, strafe, fire, read, stun, purge, use, wait). Baselines: shoot-everything, careful read-first scripted bot. Model player via Vertex Gemini behind `--live`. Experiment: memory (bounded history) vs observation-only; metrics: crew killed, crew saved, reads-before-fire, final tremor, level completion, ticks.

## Integration adaptations

The shotgun uses one 40-damage ray every eight tics; it does not simulate Doom pellets. Player thrust is .035 tiles/tic and momentum retains .78 each tic; run is always enabled. Player radius is .22 tiles; door collision opens at .85. Plain doors remain open. Use is edge-triggered; sealable B-2 closes and seals on use, then unseals and opens on the next press. Pickup ranges are .5 tiles for keys and .55 for supplies; medkits add 25 health (cap 100, not consumed when full), ammo adds 10 (cap 200), purge adds one charge. Exit is proximity within .5 tiles. These simplify navigation without removing combat choices.

Recognition takes 35 progress units within ten tiles; close range and light accelerate it and looking away decays progress. Crew kills, including Possessed, add one tremor up to six. Player kills heal 15 for crew/Possessed and 10 for demons, up to 100. Only crosshair motion and shot dispersion express trauma to humans. Stun reaches 2.5 tiles for 70 tics with a 20-tic cooldown; purge takes 35 tics within 1.5 tiles, slows momentum and spends a charge at start. Damage or leaving range interrupts without refund. Cured crew have a seeded 50% chance to warn and 15% chance to relapse after 600 tics. Crew flee/cower rather than escort the player. A centered collar shot has a seeded 40% break chance and refunds its damage; freed hounds attack other demons. Ember isolation causes retreat toward its nest. Monster attacks and deaths never award player kill counters or healing.

Hangar's red key releases its sealed closet and alerts the hound. Quarantine's B-2 proximity orders are gated in sequence. Supplies reset at each story transition; trauma carries into Quarantine. Retrying restores the current level entry tremor, so trauma remains permanent for the story run without accumulating failed attempts. End cards display authored outcome text only, with no score/statistics panel. A title, pause, death retry and two-level ending make a complete browser run. Situation selection stays behind the URL query parameter.

## Presentation and controller adaptations

The title uses original generated art with a large, subtly glitching wordmark (reduced-motion aware). The weapon occupies 33% of internal height, centered at 60% width with bob/sway/recoil intact. Near lighting has an approximately 0.35 minimum after wall shading; authored dim cells remain darker and recognition still uses their original light. Fog fades from four to eighteen tiles, with a dim blue-grey textured ceiling. A scaling metal status strip shows large health/ammo/purge text and coloured key icons; radio captions fade after four seconds and the outlined crosshair sits above gameplay layers. A development-only `window.__tremor` world getter and teleport helper support screenshots. Rendering interpolates fixed 35-Hz simulation, with frame-time flash/recoil/shake decay, speed bob, smooth aim drift and a read arc. Mouse sensitivity is local to the browser; keyboard turning remains available. Audio receives event positions and listener pose, and moving players produce footsteps. Supplies have separate procedural silhouettes. Lighting is authored per cell. There is no GPU requirement.

The host alone holds World. Observations reveal a seen automap, a 120-degree view and qualitative aim; hidden figure identity is sanitized from events. Pickups/projectiles are not read targets. Seven-tic discrete macros, constant legal IDs, bounded decision history, call/step/timeout limits and explicit fallback labels support reproducible evaluations. Baselines seek keys before doors, engage nearby figures with bounded attempts and recover from blocked strafes. Their door heuristic deliberately avoids doors until a key is acquired; it is sufficient for this suite, not a general planner.

## Health invariant

Player health is bounded to [0,100], including terminal states. Damage clamps at zero immediately and world completion clamps defensively after rules. Dead players cannot take more damage or consume medkits to revive during the death tic. Retry creates a fresh level. This was chosen after the merged damage path produced -2 health in the agent invariant test.
