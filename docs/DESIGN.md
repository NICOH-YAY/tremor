# Tremor: design brief

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
2. **Quarantine Wing: Orders.** Radio orders escalate ("seal the door" -> "survivors inside, seal it anyway"). A wounded survivor holds the blue keycard. Shared medkits.

## Feel
Fast Doom movement with momentum and friction, strafing, mouse look via pointer lock (keyboard turning fallback), head bob, weapon sway and recoil, muzzle flash lighting, screen shake, hit flashes, distance fog, textured walls, floor/ceiling casting, billboarded sprites. Fixed-step deterministic sim at 35 Hz with interpolated rendering at display refresh. Internal render ~480x270, upscaled pixel-crisp. Must hold 60 FPS on CPU-only Canvas 2D (no WebGL: the target browser has no GPU acceleration).

## Agent
The game is wrapped in the course's five operations (reset / observe / legal_actions / step / outcome). The agent plays **tick-paused**: the sim freezes while it decides. Observations are structured text (visible entities with bearing/distance/read-state, health, ammo, purge charges, tremor, keys, last events). Actions are discrete macros (turn_left/right small/large, move_forward/back, strafe, fire, read_target, stun, purge, use, wait). Baselines: shoot-everything, careful read-first scripted bot. Model player via Vertex Gemini behind `--live`. Experiment: memory (bounded history) vs observation-only; metrics: crew killed, crew saved, reads-before-fire, final tremor, level completion, ticks.
