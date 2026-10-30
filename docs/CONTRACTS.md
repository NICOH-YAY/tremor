# Tremor integration contracts

Node 24+, TypeScript, Vite and npm. PowerShell can use npm.cmd. Commands: npm ci, npm run dev (5191), npm test, npm run typecheck, npm run build, npm run eval, npm run eval:live. Vite base is './'. No id code, assets or level layouts are included. Integrator may now edit any merged module; original ownership is recorded in AGENTS.md.

## Shared data and units

src/sim/types.ts is authoritative. Coordinates/radii are tiles, velocity tiles/tic, angles and turn commands radians. TICRATE=35. Positive angles rotate toward positive Y; positive strafe is right. Movement axes clamp to [-1,1], turn is radians per tic. Player circle radius .22. Map cells are row-major, zero floor and positive wall texture IDs. Doors override the underlying cell; sealed doors or openAmount < .85 block. Optional map.light is brightness 0..1 (renderer also accepts a map encoded 0..255). createWorld clones maps, spawns and radio; resets never mutate LevelDef.

World owns all simulation state and seeded RNG; mechanics never use wall-clock time, DOM or Math.random. All entity data values are primitive. Entity IDs are unique within the current world. Core supplies transient reading/stunRequested/purgeRequested flags. World.useHeld implements rising-edge door use, including across agent macros. Idle or movement releases use.

## Simulation lifecycle

Done worlds do not advance. tick clears events, increments tic, applies movement/cooldowns, advances doors, handles door-use edges, selects the nearest aimed living figure, assigns flags, fires, runs living brains in entity order, then rule onTic hooks in registry order. It dispatches newly revealed transitions and onRead exactly once; scheduled radio, map keys, entity supplies, closet release and proximity triggers follow. Finally health is clamped at zero, death takes precedence over exit, expired projectile corpses are pruned and the event log retains the last 100 events.

Core shots use SHOT_DAMAGE=40 exported from types.ts, seeded tremor spread, eight-tic cooldown, and the nearest ray/circle intersection before walls. Pickups and fireballs are excluded from shot/read targets. onFire runs before damage (collar breaks refund SHOT_DAMAGE); hit follows damage. Core lethal hits mark dead, update player crew/demon counters, emit kill and dispatch onKill. Possessed count as crew. Monster-on-monster deaths emit kill without player counters, trauma or healing hooks. hurtPlayer clamps at zero immediately, ignores damage once dead, and applies armor absorption first. A final world clamp preserves the public invariant including terminal states. Zero-health players cannot consume supplies to revive.

Recognition owns progress/revealed; core owns read event/counter and hook dispatch. Stun/purge enforce timers, cooldowns, range, interruption and charges in mercy.ts. A stun emits stun; a cure emits cured. Collar release emits collarBreak, never a fake zero-damage hit. Fireball spawns emit fireball and bursts emit explosion; monster acquisition emits alert. Dead fireballs linger eight tics and are pruned by core independently of new projectile spawns. Corpses use data.diedAt.

## Content lifecycle

Map keys collect within .5 tiles. Entity pickups use kind:'pickup', data.item:'medkit'|'ammo'|'purge' (also 'red'|'blue' keys), collect within .55, then health=0/state='dead'. Medkits add 25 capped at 100 and remain if full; ammo adds 10 capped at 200 and remains if full; purge adds one. Key collection releases the red-tagged Hangar closet: unseal/open nearby non-sealable door, alert hound, consume its closet tag once. The closet_red proximity marker is once-only content metadata.

Plain unsealed doors open with use and remain open. Sealable B-2 use closes/seals; a subsequent press unseals and opens. Door events carry coordinates and state; sealed is authoritative on the Door. Crew flee/cower and do not follow the player. Quarantine order2 requires order1 and order3 requires order2; early proximity does not consume the trigger. Scheduled radio fires at exact integer tics, proximity text once. Exits trigger within .5 tiles. Hangar then Quarantine form the story; per-level reset restores supplies, keys and RNG; story transitions carry trauma and retries restore the level entry tremor. endText(world) produces intermission prose; the human UI has no score/statistics panel.

## Rendering, human input and audio

Raycaster(canvas) implements Renderer; resize gets output dimensions. render receives World read-only, previous player pose, interpolation alpha and reused RenderView. Rendering/cosmetics must not mutate World or consume simulation RNG. Internal height is 270, width follows aspect (320..640); typical 480x270. Canvas upscales with smoothing disabled and pixelated CSS. World light is read by core.

Main supplies flash/recoil 0..1, shake in internal pixels (typically 0..6), weaponSway -1..1, bob=player.bob. Effects decay by frame delta. Player/entity positions interpolate; entity angle is not interpolated. Crosshair uses continuous time sinusoids scaled by tremor, read progress draws an arc and reveal draws a brief crew/possessed/demon label. Static supply HUD updates only when values change; overlay normally clears only its previous crosshair region, with full redraw for damage/pickup/death effects. Main reuses command, pose and view objects. Renderer reuses image/depth/sprite buffers; per-tic histories allocate, not per-pixel.

Title art fills the window. Click begins Hangar (or valid ?level=id demo). End cards Continue to Quarantine then title. Death fades red and Try again resets the current level. Esc pauses with Resume, saved sensitivity slider, Restart and Quit. Blur/pointer-lock loss pauses; keyboard turning works without lock. Run is default. Pause consumes no simulation time.

AudioBus.play(name,source,listener) receives every event with a source: entity position for IDs, door coordinates, noise position or player for local events. Main maps fire->shotgun, playerHurt->hurt, cured->purge, collarBreak->zap, explosion->fireball, alert->alert_kind; other names pass through. Moving players emit step, bus rate-limits it. Audio unlock, spatial attenuation/pan and unsupported-context handling belong to the original procedural bus. Radio text is displayed briefly at the bottom.

## Controller boundary

src/player_interface.ts exports reset(seed,levelId), observe(world,player_id), legal_actions(world,player_id), step(world,player_id,action), outcome(world). Legacy two-argument step is retained. reset defaults to test_room for harness compatibility; browser explicitly requests hangar. Invalid levels/players throw where documented in implementation; unknown action IDs return validation feedback from step.

Controllers receive detached observations and IDs only, never authoritative World. Observation includes pose, supplies, keys, qualitative aim, last five whitelisted events, seen automap and living figures within 120-degree FOV/line of sight. Unread identity is unknown figure; stunned is a visible identity-neutral state; a shared event whitelist suppresses hidden activity and raw kill/read/hit metadata. Pickup/projectile entities are excluded from figure/read lists. Seen map is host-side WeakMap state. Exit is visible only once its cell has been seen. Constant legal vocabulary avoids identity leakage even at terminal state; invalid uses consume idle simulation time. Purge attempts are accepted without hidden-state validation; stunned crew and Possessed both channel and spend a charge.

STEP_TICS=7 (0.2 s). ACTION_IDS: turn_left_small, turn_left_large, turn_right_small, turn_right_large, forward, back, strafe_left, strafe_right, fire, read, stun, purge, use, wait. Small turns total 35 degrees, large 90. Terminal worlds stop early. outcome reports terminal reason, exit score 100 (otherwise 0) and independent evaluator metrics. These scores/trauma numbers never appear in the human HUD.

Runner caps episodes at 400 actions/400 controller calls and 20 s per call and five minutes wall-clock per episode by default. Errors are separate from illegal actions; unknownUsageCalls marks missing usage. Failed calls count, timeouts terminate, three invalid decisions cause a separately labelled fallback wait. No fallback counts as a model move. History is K=8; observation-only is a separate player. Baselines use only these observations, bound engagement attempts, recover blocked strafes and seek keys before doors. Their optional-door heuristic is specific to these maps. Situation suite and seeds remain fixed in src/eval/suite.ts; story checks are additional integration coverage.

## Verification limits

Tests cover deterministic rules, meaningful health regression, targeting, supplies, sealing, closet, ordered radio, projectile removal, hidden-information boundary, action legality, terminal path, episode limits, mocked UI lifecycle, seven-level baseline completion and 480x270 CPU raster budget. Baselines finish all seven levels at seeds 17/83 within 400 actions. Node raster-plus-simulation benchmark is below 6 ms averaged per level; fallback textures are used and browser canvas upload/DOM/audio are excluded. Integration evidence is in eval/integration-*.json. Actual pointer lock, audio and visual QA were not exercised: the integration session has no available browser surface. No live model trials or Pages deployment are claimed.

Environment note: direct npm run eval was attempted but this sandbox reports uv_os_get_passwd ENOMEM inside tsx before the CLI starts. Baseline evidence was therefore generated by tests/baseline.test.ts calling the same runEpisode and baseline controllers, with no mocked decisions. No live credentials or paid model calls were used.
