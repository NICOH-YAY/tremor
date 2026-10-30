# Decisions — 2026-10-30

- Seven tics (0.2 seconds) per action beats per-tic decisions: preserves 35 Hz mechanics while bounding controller overhead. Small turns total 35 degrees; large turns 90 degrees. Movement retains simulation momentum.
- Macro vocabulary beats continuous input: reproducible, finite decisions. ACTION_IDS in src/player_interface.ts is authoritative: turn_left_small, turn_left_large, turn_right_small, turn_right_large, forward, back, strafe_left, strafe_right, fire, read, stun, purge, use, wait.
- Constant legal list beats contextual availability: stun/purge never reveal hidden identity by appearing/disappearing. Invalid uses return valid:false and reason, consume an idle seven-tic interval, and receive runner feedback. Terminal calls do not advance simulation. The legacy two-argument step remains supported.
- Seen automap beats entity-only observations: supports credible exploration without granting the full map. WeakMap memory belongs to each host World; no world.ts contract changes. Cells must enter line of sight and 120-degree FOV; exit appears only after its floor cell is seen. Pose is proprioceptive navigation information. Door glyphs disclose geometry only, not hidden keys or seal state.
- Qualitative aim (steady/shaky/very shaky) beats numeric tremor: human HUD has crosshair drift, no tremor meter. Numbers remain evaluator-only metrics. Raw events are sanitized so kill kind and noise positions cannot disclose hidden identities/locations. Visible supplies and keys, radio and a whitelist of local event types are observable; hidden activity types are suppressed.
- Aggressive and careful BFS baselines beat random actions: both navigate observed floor/doors toward exit or an unexplored frontier; aggressive fires at aimed figures; careful reads first, spares crew/cured targets, and attempts close stun/purge before shooting possessed. No baseline receives hidden world fields.
- K=8 history beats unbounded context for predictable cost; obs-only is the ablation, with fresh controller instances per episode. Both see the same persistent seen map; obs-only has no private text history.
- Three tuning and two held-out situations, seeds 17/83, beat one handpicked map. EVALUATION-PLAN.md was written before implementation/testing. Missing levels fail rather than silently changing the suite.
- Evaluation score exit=100, otherwise=0 beats moral weighting. Crew killed/saved, reads, fired-unread and final tremor remain separate metrics. The game shows no score.
- Runner owns state and limits. Failed decisions count as calls; three invalid decisions cause a labelled fallback wait. Timeout ends the episode explicitly. Fallbacks never count as model moves. Replay is labelled mocked and never substitutes for live trials.
- Regional Vertex fallback is limited to global location/model availability errors: the failed call is counted and the next budgeted call uses us-central1. SDK automatic retries are disabled so requests cannot bypass call accounting. Cost stays null until prices are verified on the run date.


- Observed integration regression: merged mechanics damage left health at -2 and failed the agent invariant. Preserve [0,100] in terminal states rather than weakening the invariant: hurtPlayer saturates damage at zero and ignores further damage, tick clamps defensively, and dead players cannot consume medkits. tests/integration.test.ts names the genuine test "regression: player health can go negative after merge of mechanics damage": 3 damage against 1 health must produce zero and terminal death. The original agent invariant remains unchanged.
- Baseline integration exposed reading beyond ten tiles, an aim cone wider than hit circles, blocked strafes and routes toward keyed doors before obtaining a key. Nearby engagement, perpendicular alignment, bounded attempts, blocked-strafe recovery and key-first exploration beat altering maps for a stalled controller. Both baselines finish all seven cases at seeds 17/83. This heuristic is suite-specific: it avoids optional plain doors until a key is acquired.
- Core prunes dead fireballs after eight linger tics independently of future shots. The worker's 80-tic corpse assertion now requires removal. Player shots and read targeting skip projectiles, so projectiles cannot inflate demon kills.
- Story transitions reset inventory but carry trauma through the story; retry restores the level entry tremor. Intermissions show authored prose without a separate score panel. Node CPU timing measures software raster plus simulation with fallback textures; it excludes browser canvas upload/DOM/audio and is not a measured browser frame guarantee.


## Response decisions, 2026-10-30

- Independent review found a real identity oracle. Stun now affects every aimed figure within MERCY.STUN_RANGE (2.5 tiles), including crew who cower while stunned. The visible stunned state and generic stun event are identical before recognition. Purge attempts are accepted without checking hidden kind/state in validation, including repeats with zero charges. Crew and Possessed both consume a charge and channel when stunned/in range; only an actual Possessed cure increments the evaluator saved counter. Cure/recognition are legitimate reveals.
- Both observation and step events use one whitelist: radio text, collected pickup name, local fire/stun/playerHurt/levelEnd types. All other raw events are omitted, including hidden alert/fireball/collarBreak activity and kill metadata. Validation reasons use only public action/player/terminal state and geometric stun reach.
- Model/baseline parity: summary explicitly contains every field used by either baseline, including exact own position, angle in radians, tic, compass direction/degrees, figures, supplies and map. The seen map marks the player with > v < ^. Baselines read those same observation fields, never World. Visible pickup names/coordinates now match the supplies claim.
- Call/parse errors have a separate errors metric and never count as illegal actions or toward invalid-action fallback. Known usage from malformed responses is retained; unknownUsageCalls records transport/timeout calls without usage, so token totals are explicitly partial. Episodes have a five-minute wall-clock cap as well as existing call/action/per-call caps.

## Observed regressions

- `tests/agent.test.ts`: "regression: stun/purge feedback leaked hidden identity (found by independent review)" was written and run failing before the fix. It compares step validity, feedback, sanitized events and subsequent observations for identically placed unread crew/Possessed through stun and purge. The all-action paired test also initially failed on Possessed-only alert events. It now runs every ACTION_ID with matched stunned behavior to isolate the interface from legitimate hostile movement. Existing kill-event and negative-health regressions remain.


## Real-engine amendment, 2026-10-30

- The browser and evaluated player now share doomgeneric, the Tremor C hooks,
  Freedoom Phase 1, and tremor.wad. This replaces evaluating the easier custom
  raycaster while presenting a different game to people. Existing upstream code
  stays vendored with GPL provenance; new adapter/rule code is original.
- Freedoom beats distributing id's proprietary levels: freely licensed complete
  Episode 1 data makes play and CI reproducible. A local IWAD loader lets owners
  play their own DOOM data without uploading or redistributing it. Doom II and
  arbitrary PWAD compatibility are outside the evaluated scope.
- Seven-tic commands preserve real Doom physics and weapon timing while reducing
  model calls compared with per-tic control. Small/large turns are approximately
  35/90 degrees over a full action. Movement uses Doom walk forward/strafe values
  25/24. Read and purge require five continuous actions (35 tics). Weapon selection
  is explicit: fist, pistol, shotgun. The browser retains its broader controls.
- Synchronous WASM compilation and an opaque per-episode module preserve the
  five synchronous course operations, versus introducing async signatures or a
  second simulation. Node initialization reads bundled artifacts; CI needs no
  emsdk. A separate fixture build exposes test helpers absent from production.
- Observations whitelist health, armor, rounds, purge charges, weapon, keys,
  qualitative steadiness, 90-degree/P_CheckSight-visible entities, seen automap
  lines and five displayed messages. Unknown humans share one label. No actor
  IDs, coordinates, hidden allegiance, numeric trauma, or kill metrics enter the
  observation. A JSON summary contains all fields available to baselines.
- The map is north-up, 25x25, 64 units/cell, centered on the player's cell. Only
  ML_MAPPED lines are sampled. Software rendering updates those flags without a
  canvas or sound. Rendering does not advance tics. Coarsening deliberately
  sacrifices precise pathfinding; it does not expose full-map geometry or hidden
  exit tags. Baselines explore unseen boundaries and periodically use nearby
  walls/switches, including exits, without privileged navigation.
- Validation is constant across identity, range, inventory and charges. Every
  known macro is accepted; failed stun/purge effects are not validation errors.
  Invalid inputs consume idle time. Natural hostile movement and a completed
  READ/purge can legitimately distinguish humans. Purge success reveals crew;
  charge use and saving are then observable effects. Before that transition,
  matched frozen crew/possessed fixtures remain indistinguishable.
- Baselines keep bounded map-visit memory and use only public fields. Aggressive
  shoots the nearest aligned figure; careful reads first, approaches/stuns/purges
  identified possessed when charged, and both switch to fists without rounds.
  This beats random movement as a reproducible cheap comparison, but initial
  smoke trials fail to complete E1M1. No success claim carries over from the old
  custom suite. K=8 versus observation-only remains the model ablation.
- Doom health pickups may reach 200; tests bound health in [0,200]. Tremor kill
  healing caps at 100. Trauma is monotonic within an episode, capped at six, and
  resets only on reset/new game. Seed selects the initial 256-entry P_Random
  table index before map spawning, rather than a wall-clock seed; only the low
  eight seed bits select a stream. Seeds 17 and 83 are distinct streams.
- Browser regression fixes: noInitialRun plus C/JS entry guards prevent duplicate
  initialization; one intro listener resolves all waiters; pointer lock is
  requested only on canvas clicks and rejection is caught. Music uses the
  existing original MUS/MIDI bridge with Nuked OPL3, not Chocolate Doom music code.
- Real-engine smoke testing exposed missing Doom II decoration sprites in
  Freedoom Phase 1 after hyper-gore kills, and a revealed-crew range check using
  the hostile animation frame. Check sprite availability before spawning a gore
  decoration and validate the actual crew display frame. Both have engine tests.

The decisions and success claims above this amendment describe the superseded
TypeScript prototype and must not be read as current engine evidence.


## Horror choices, 2026-10-30

- Corpse-sight terror beats time-based fear: movement and attention affect exposure;
  waiting in an empty room cannot manufacture fear. Per-body saved flags prevent
  farming it by looking away. Decay is intentionally slow; half carries forward.
- Rare drops and sparse map ammo beat zero resupply: exploration and mercy offer
  small recoveries without restoring a shooter economy. Enemy death drops exclude
  crew. Purging awards three rounds from the survivor, not a radio reward.
- An original procedural score beats OPL as the default horror bed: a bounded
  oscillator graph can respond to fear and nearby alert monsters without shipping
  music assets. OPL remains selectable, preserving IWAD music.
- Y-shearing beats true 3D look: it preserves the software renderer's geometry and
  tic simulation with inexpensive plane-slope updates. It distorts at extremes,
  so pitch is clamped. Tic-command recording beats live simulation input because
  demos and agents must remain reproducible.
- Cached low-resolution Canvas overlays beat JavaScript full-frame pixel filters.
  A short mono reverb impulse beats long convolution tails on the target CPU.
- A map-order key/door/exit heuristic beats hard-coded Freedoom coordinates for
  compatibility with user IWADs, at the cost of imperfect route ordering. A future
  sector reachability solver should replace it before claiming universal routing.
- Retaining the native 320x200 renderer beats an unverified high-resolution change
  in this patch. SCREENWIDTH, patches, HUD and view tables need coordinated work;
  640x400 is explicitly unfinished, not represented by an upscaled placebo.

See the implementation/verification limits in DESIGN.md. Save format Tremor 2 and
mod demo v113 intentionally replace the incompatible prior layouts.
