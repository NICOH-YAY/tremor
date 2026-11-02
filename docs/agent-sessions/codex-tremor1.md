You are building the SCAFFOLD of "Tremor" in D:\Coding VS\tremor (already contains docs/DESIGN.md — read it first). After you finish, three other agents will work IN PARALLEL on separate git branches (renderer, enemies+rules, levels+audio), and you will later merge them. So your most important job is clean, stable module boundaries and shared types that parallel workers can code against without touching each other's files.

Stack: TypeScript (strict), Vite, Vitest (happy-dom for DOM tests), Node 24, npm. No WebGL, no game engine, no runtime deps unless essential. Canvas 2D only. Original code only: do NOT copy any id Software / linuxdoom code.

Create:
1. package.json scripts: dev (vite, port 5191), build (vite build to dist, base './'), test (vitest run), typecheck (tsc --noEmit). git init, .gitignore (node_modules, dist), initial commit on branch main.
2. src/sim/types.ts — the SHARED CONTRACT. Plain numbers. Define and export:
   - TICRATE = 35. Vec2. Angle in radians.
   - TileMap { width, height, cells: number[] (0 empty, >0 wall texture id), doors: Door[], light?: number[] (0..1 per cell), spawns, keys, exit, triggers }.
   - Door { x, y, key?: 'red'|'blue'|null, openAmount, state, sealable?: boolean, sealed?: boolean }.
   - EntityKind = 'possessed'|'ember'|'hound'|'crew'|'fireball'|'pickup'.
   - Entity { id, kind, pos, angle, radius, health, state (string union incl. 'idle','chase','attack','pain','stunned','cured','dead','flee'), stateTics, target?: number, alerted, readProgress (0..35), revealed: boolean, collar?: boolean, data: Record<string, number|string|boolean> }.
   - Player { pos, vel, angle, health, armor, ammo, purgeCharges, keys, tremor (>=0), readTargetId, weaponCooldown, bob, kills: {crew, demons}, saved, reads, firedUnread }.
   - InputCmd { forward: -1..1, strafe: -1..1, turn: number (radians this tic), fire, stun, purge, use, read (hold) } — one per tic. Both human input and the agent produce InputCmds.
   - GameEvent union (fire, hit, kill {id, kind, wasCrew}, cured, noise {pos}, pickup, door, radio {text}, levelEnd, playerHurt {amount}, etc).
   - World { tic, seed, rngState, map, player, entities, events (this tic), log (bounded), levelId, done, outcome? }.
   - Interfaces each parallel module implements (export as types):
     * EnemyBrain: (world, entity, rng) => void (per-kind AI, file src/sim/enemies/<kind>.ts)
     * RuleHook: { name, onTic?(world), onFire?(world, hitId|null), onKill?(world, e), onRead?(world, e) } (files src/sim/rules/*.ts)
     * LevelDef: { id, title, map: TileMap, entities: spawn list, radio?: scripted triggers, endText(world) } (files src/levels/*.ts)
     * Renderer: { resize(w,h), render(world, prevPose, alpha, view) } where view = {shake, flash, weaponSway, recoil, bob} (files src/render/*)
     * AudioBus: { play(name, pos?, listener?) } (src/audio/*)
3. src/sim/rng.ts — deterministic seeded RNG (own implementation, e.g. mulberry32).
4. src/sim/world.ts — createWorld(level, seed), tick(world, cmd): player movement with momentum/friction and collision vs walls/closed doors (circle vs grid), firing (hitscan ray vs entities with spread scaled by tremor; temptation heal on kill via rule), use (doors/keys), runs registered RuleHooks and EnemyBrains via registries (src/sim/registry.ts) so parallel modules only ADD files + one registry line. Deterministic: same seed + same cmds => same world. Put stub brains (simple chase) and stub rules (no-op) in place for possessed/ember/hound and recognition/trauma/temptation/mercy/noise, each in its own file, so workers replace bodies only.
5. src/levels/test_room.ts + src/levels/index.ts — a small playable box level with a door and 2 stub enemies.
6. src/render/raycaster.ts — a SIMPLE working DDA raycaster: flat-colored walls with side shading, flat floor/ceiling, sprites as colored billboards with z-buffer. Internal resolution 480x270 rendered into an ImageData (Uint32Array view), putImageData, then drawImage scaled up with imageSmoothingEnabled=false. This will be replaced by the renderer worker; keep it behind the Renderer interface.
7. index.html + src/main.ts — game loop: fixed 35 Hz sim accumulator, render every requestAnimationFrame with interpolation alpha between prev and current player pose. Pointer-lock mouse look with keyboard fallback (WASD move/strafe, arrows turn, click/Ctrl fire, E use, F stun, Q purge, hold R or right mouse to read). Title screen ("TREMOR", click to begin), pause on Escape / blur, FPS counter toggle (backquote). HUD on an overlay canvas: health, ammo, purge, keys. NO tremor number and NO morality display (tremor is felt via crosshair drift only).
8. src/player_interface.ts — course five operations: reset(seed, levelId) -> state, observe(state) -> structured observation + text summary (visible entities with bearing deg, distance, revealed kind or 'unknown figure', health, ammo, purge, keys, last 5 events), legal_actions(state) -> ids from a fixed macro set (turn_left_small/large, turn_right_small/large, forward, back, strafe_left, strafe_right, fire, read, stun, purge, use, wait), step(state, actionId) -> runs that macro for 7 tics via InputCmds, returns new state + events, outcome(state) -> {done, reachedExit, dead, ticks, crewKilled, crewSaved, demonsKilled, reads, firedUnread, finalTremor}. Host owns state; controllers only see observations and legal ids.
9. tests/: determinism, movement/collision, door+key, hitscan kill, player_interface contract (5 ops, legal actions valid, step advances tics), happy-dom smoke test that main boots and shows the title.
10. AGENTS.md describing module ownership: src/render = renderer worker, src/sim/enemies + src/sim/rules = mechanics worker, src/levels + src/audio = content worker, everything else = integrator (Codex). Workers only add/replace files in their area plus one line per new module in src/sim/registry.ts or src/levels/index.ts.
11. docs/rule-source-map.md skeleton table: Rule | Source (linuxdoom-1.10 file/function, or "design") | Our file | Test. Seed rows: TICRATE (doomdef.h), hitscan (p_map.c P_LineAttack), noise alert (p_enemy.c P_NoiseAlert), keyed doors (p_doors.c EV_DoLockedDoor), infighting (p_inter.c P_DamageMobj), pain chance (info.c), plus "design" rows for Recognition, Trauma, Temptation, Mercy.

Run npm install, npm test, npm run typecheck, npm run build; all must pass. Commit on main: "Scaffold Tremor: shared contracts, sim, simple raycaster, interface". Then write docs/CONTRACTS.md (contracts + file map for workers) and commit it.
