# Active real-engine design ? 2026-10-30

The browser and agent use the same doomgeneric/Tremor engine with Freedoom Episode
1. Recognition introduces uncertainty before violence: crew and possessed share
an unknown-figure label until 35 aimed tics of READ. Killing any human, including
possessed, increases persistent aim instability (cap6). Human/demon kills heal
15/10 health up to100. A fixed enemies+1 ammunition budget prevents indefinite
firearms; fists remain available with tenfold damage. Crew never attack or damage
the player and cower in danger. Close STUN freezes humans for70 tics; holding
PURGE for35 uninterrupted nearby tics saves a stunned possessed human, reveals
crew and spends one of two charges. Damage interrupts purge. These rules create
time/resource pressure without a moral score. Exact constants and implementations
are in `engine/tremor/tremor.h`, `tremor.c`, and the rule/source map.

The evaluated adaptation is seven-tic macros and public-only observations, with
an opaque authoritative engine owned by the runner. See CONTRACTS and the
real-engine amendment in DECISIONS for alternatives and observation limits.

## Superseded prototype design

The material below is historical design, not current engine behavior or evidence.
Its collar/sealing/custom levels and clean-room claims do not apply to the engine.

# Tremor: design brief

The browser entry point now runs the real vendored Doom engine with original Tremor patches. `engine/PATCHES.md` and `engine/tremor/tremor.h` describe the active implementation and constants. The TypeScript prototype below is retained as superseded historical source; its custom levels, enemies, collar mechanic and timing adaptations are not used by the browser Doom mod. The loaded IWAD supplies browser maps, enemies, weapons, sounds and episode finales.

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
45?135 degrees wide. Fists whiff without damage. Existing trauma offsets stack.
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
