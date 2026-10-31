# Rule/source map ? real-engine amendment 2026-10-30

Active engine source is `engine/doomgeneric/doomgeneric/` (doomgeneric's adaptation
of id Software's GPL linuxdoom code). **code** means inherited implementation,
with Tremor hook changes identified separately; **design** means original Tremor
rules. Locators are file + function, not unstable line numbers. The original
[TypeScript map](rule-source-map-ts-superseded.md) is superseded.

| Rule | Label | Engine locator / original source | Active adaptation |
| --- | --- | --- | --- |
| 35Hz fixed simulation | code | `doomdef.h / TICRATE`; `g_game.c / G_Ticker`; linuxdoom equivalents | Agent calls the same ticker directly; browser keeps real-time scheduling. |
| Walk, run, strafe, turn, momentum | code | `p_user.c / P_MovePlayer, P_Thrust`; `g_game.c / G_BuildTiccmd` | Browser input uses ordinary commands; agent walks with 25 forward / 24 strafe. |
| Friction, gravity and actor movement | code | `p_mobj.c / P_XYMovement, P_ZMovement, P_MobjThinker` | Doom fixed-point physics, sector heights and blocking retained. |
| Collision, sliding, stairs, line use | code | `p_map.c / P_TryMove, P_SlideMove, P_UseLines` | No grid-raycaster replacement. |
| Hitscan occlusion and autoaim | code | `p_map.c / P_AimLineAttack, P_LineAttack` | Tremor aim offset added in weapon attack hooks. |
| Weapon timing, firing and switching | code | `p_pspr.c / P_MovePsprites, A_FirePistol, A_FireShotgun, A_Punch, P_CheckAmmo` | Ordinary weapons/timing; shared ammunition and stronger fists are design rows below. |
| Health, armor, damage and death | code | `p_inter.c / P_DamageMobj, P_KillMobj, P_GiveBody` | Crew damage blocked, kill healing added; health pickups retain Doom cap up to 200. |
| Pickups, ammo and inventory | code | `p_inter.c / P_TouchSpecialThing, P_GiveWeapon, P_GiveAmmo` | Ammo pickups do not refill Tremor's fixed per-level budget. |
| Normal/keyed doors | code | `p_doors.c / T_VerticalDoor, EV_DoLockedDoor, EV_VerticalDoor` | Original keys, timing, use and monster behavior. |
| Floors, lifts, ceilings and hazards | code | `p_floor.c / T_MoveFloor`; `p_plats.c / T_PlatRaise`; `p_ceilng.c / T_MoveCeiling`; `p_spec.c / P_PlayerInSpecialSector` | Original loaded-map sector rules. |
| Switches, exits and level transitions | code | `p_switch.c / P_UseSpecialLine`; `p_spec.c / P_CrossSpecialLine`; `g_game.c / G_ExitLevel, G_DoCompleted` | Agent stops at pending completion; browser continues ordinary intermissions. |
| Monster sight, chase, attacks, pain | code | `p_enemy.c / A_Look, A_Chase, A_PosAttack, A_TroopAttack, A_SargAttack`; `info.c / states, mobjinfo` | Crew short-circuits hostile think; stunned humans freeze. |
| Alerts and infighting | code | `p_enemy.c / P_NoiseAlert`; `p_inter.c / P_DamageMobj` | Crew additionally cower from nearby visible demons/gunfire. |
| Missiles and explosions | code | `p_mobj.c / P_SpawnMissile`; `p_map.c / PIT_CheckThing, P_RadiusAttack` | Doom collision, damage and species rules retained. |
| Visibility and automap discovery | code | `p_sight.c / P_CheckSight`; `r_segs.c / R_StoreWallRange`; `am_map.c / AM_drawWalls` | Adapter uses LOS + 90? FOV and only ML_MAPPED lines. |
| Demo-style deterministic RNG | code | `m_random.c / P_Random, M_ClearRandom` | Headless reset starts the 256-entry RNG at seed & 255 before spawning; browser uses original reset. |
| Human classification and harmless crew | design | `engine/tremor/tremor.c / TR_MapSpawn, TR_Think, TR_BlockDamage`; `tremor.h / TR_CREW_THRESHOLD` | POSS/SPOS classify at spawn with P_Random <90. Crew never attack/damage player. |
| Recognition | design | `engine/tremor/tremor.c / TR_PlayerThink, crosshair`; `tremor.h / TR_READ_TICS` | 35 continuous aimed tics reveal crew/possessed; 90? observer never reports hidden identities. |
| Permanent human-kill aim instability | design | `engine/tremor/tremor.c / TR_Kill, TR_Aim, TR_Sway`; `tremor.h / TR_MAX_TRAUMA, TR_AIM_UNIT` | Any human kill by the player increases trauma to six; demon kills do not. Qualitative aim only in observation. |
| Kill healing | design | `engine/tremor/tremor.c / TR_Kill`; `tremor.h / TR_HUMAN_HEAL, TR_DEMON_HEAL, TR_HEALTH_CAP` | Player kills restore 15 human / 10 demon health, capped at 100. |
| Shared finite ammunition | design | `engine/tremor/tremor.c / TR_LevelStart, TR_CheckAmmo, TR_SpendRound`; `p_inter.c / P_GiveAmmo` | Starts post-classification enemies +1. Firearms spend one shared round, never negative; zero switches to fists. |
| Stun and purge | design | `engine/tremor/tremor.c / TR_PlayerThink, TR_Damaged`; `tremor.h / TR_STUN_TICS, TR_PURGE_TICS, TR_PURGE_CHARGES` | Nearby humans stun for 70 tics with 35-tic cooldown; purge takes 35 uninterrupted close tics, two charges/level, reveals saved crew. |
| Strong fists, impact and hyper gore | design | `engine/tremor/tremor.c / TR_Impact, TR_Gib, TR_Kill, TR_Shot`; `p_pspr.c / A_Punch` | Tenfold fist damage; optional render effects. Gore decoration sprites must exist in loaded IWAD. |
| Crew and revealed possessed visuals | design | `r_things.c / R_ProjectSprite`; `engine/tremor/tremor.c / TR_RedMap, TR_MergeCrewSprites` | Original crew A/B art, faint identified-possessed red tint; actual display frame validated. |
| Audio output | design | `engine/platform/sound_web.c`; `music_web.c / tremor_music_render`; `engine/vendor/nuked-opl3/opl3.c` | Original Web Audio DMX + MUS/MIDI bridge, licensed Nuked OPL3; Node target starts -nosound. |
| Agent macros, observation and score | design | `engine/tremor/agent_api.c / tremor_agent_reset, tremor_agent_step, tremor_agent_observe, tremor_agent_outcome`; `src/player_interface.ts` | 7 tics, 17 macros, public-only JSON; exit=100 else0; constant validation. See CONTRACTS and DECISIONS. |
| Episode/call limits, fallback, model memory | design | `src/eval/runner.ts / runEpisode`; `src/agent/model_player.ts / modelPlayer` | 600 steps/calls, timeout, labelled fallback, K=8 vs obs-only; no world/tools reach controllers. |

Rationale for original rules: [active design](DESIGN.md), [decisions amendment](DECISIONS.md).
Upstream attribution and license locators: [engine provenance](../engine/UPSTREAM.md).


## Horror adaptation rule locators (2026-10-30)

| Rule | Origin | Locator |
| --- | --- | --- |
| Corpse-sight terror, once per body, slow decay, carryover | design + original code | engine/tremor/tremor.h TR_TERROR_*; tremor.c corpses / TR_LevelStart |
| Fear hit threshold and damage scaling | design + original code | tremor.c TR_Hit / TR_Damage / TR_Aim; p_pspr.c A_Punch; p_inter.c P_DamageMobj |
| Rare map ammo, death drops, mercy rounds | design + original code | tremor.c TR_LevelStart / TR_Kill / TR_PlayerThink / TR_Ammo; p_inter.c P_GiveAmmo |
| Map-derived objectives and public bearing | design + original code | tremor.c TR_StoryTick / key_color / exit_special; agent_api.c tremor_agent_observe |
| Episode radio, ninety-second cooldown | design + original code | tremor.c TR_Radio / TR_QueueRadio; public/radio/lines.json; public/horror.js speak |
| Paused objective preview | design + original code | tremor.c tremor_preview / TR_PreviewView; r_main.c R_RenderPlayerView; public/horror.js preview |
| Y-shear freelook and recorded pitch | design + original code | g_game.c G_BuildTiccmd and demo read/write; r_main.c R_SetupFrame; p_map.c P_LineAttack; p_mobj.c P_SpawnPlayerMissile |
| Interpolation, suit light, cosmetic flicker | design + original code | tremor.c TR_Interpolate / TR_Light; r_things.c R_ProjectSprite; r_plane.c R_MapPlane |
| Horror sprite transform | design + original code with Freedoom-derived assets | scripts/build-tremor-wad.py build; tremor.c TR_MergeCrewSprites |
| Public felt state, no exact terror / hidden identity | design + original code | agent_api.c tremor_agent_observe; src/player_interface.ts Observation |


## Follow-up rules and public information (2026-10-30)

| Rule / public cue | Locator | Visibility constraint |
| --- | --- | --- |
| Required-lock objective chain / normal exit preference | tremor.c TR_StoryTick / TR_KeyColor | Same objective text, bearing and distance bucket on human TAB HUD; no route graph is sent to controllers. |
| D/S/T and key-colour activation legend | tremor.c TR_LineMarker; am_map.c AM_drawWalls; agent_api.c automap | Only mapped drawable lines; secret markers suppressed; human glyphs share classification. |
| Visible floor history / map arrow | agent_api.c discover / automap |90-degree view and occlusion; observation cannot discover geometry; no map origin or world coordinates. |
| Props, barrels and entity elevation | agent_api.c label / tremor_agent_observe | Same FOV and LOS filter as other visible entities; unknown humans remain identity-neutral. |
| HUD inventory and visible motion result | agent_api.c tremor_agent_step / tremor_agent_observe | Owned weapons, moving/blocked/still; no displacement or collision geometry returned. |
| Constant combined controls | agent_api.c tremor_agent_step; player_interface.ts ACTION_IDS |36 constant seven-tic macros, including simultaneous movement/turn with fire or READ; no privileged action. |
| Bounded bot memory and map search | src/agent/baselines.ts | Public map cells,32 prior bearing rays, one remembered supply, bounded visit/block/attempt grids; no engine imports. |
| Episode transcript and save revision 3 | tremor.c TR_QueueRadio / TR_RadioLog; p_saveg.c P_ArchivePlayers / P_UnArchivePlayers; engine-page.js Radio log | Same bounded history accessible to humans; playback queue independent. |
| Per-frame mouse prediction and interpolation | d_loop.c TryRunTics; g_game.c G_BuildTiccmd; p_user.c P_MovePlayer; tremor.c TR_BrowserMouse*; r_main.c R_SetupFrame | Presentation prediction is reconciled with recorded tic commands; no simulation-rate change. |
| Browser-only diagnostics | engine/platform/doomgeneric_web.c; engine-page.js debug query | Setters translation unit excluded from both agent builds; artifact regression enforces absence. |
| Six-minute simulated action cap / terror reporting | runner.ts; agent_api.c tremor_agent_step / tremor_agent_outcome; scripts/eval.ts |1800 actions/calls; descriptive terror bucket is evaluation-only. |

Open door cue: tremor.c `TR_DoorOpen`, agent_api.c `automap`, and am_map.c glyph
colour share the56-unit visible aperture test. `d` is open, `D` closed. The
controller's64-unit USE probe and connected-marker retry bound are in
baselines.ts `navigate`; this fixes retrying each map pixel and closing open doors.

## Public route rule ? 2026-10-31 UTC

`engine/tremor/tremor.c: TR_StoryTick / route_update / TR_ObjectiveBearing`
replaces the straight-line objective arrow with a waypoint up to 256 units down
a route on a 16-unit lattice over the level blockmap bounds. Walls have16-unit
player clearance; sectors supply floor/ceiling heights. Weighted traversal avoids
damaging floors and large drops, and resolves missing cards and tagged switch
dependencies. Closed manual doors are planned as USE passages, never assumed
already open. Unsupported height/ceiling transitions are excluded. Smoothing
checks intermediate cells instead of cutting corners.

The cue refreshes every seven tics (rather than the proposed35): tracing showed
that holding a short corner waypoint for a full second caused overshoot and
reversal. Search storage is bounded; dependency recursion is capped at four.
Moving actors never affect route construction. This is an original planner,
not copied engine navigation code. It is not a universal lift/teleporter solver.

`agent_api.c` serializes only the resulting public objective text, relative
bearing and existing distance bucket. `tremor_story` supplies the identical
bearing to `public/horror.js`'s TAB arrow. Distance remains to the final current
objective, not to the intermediate waypoint. No graph, path, coordinates,
actor IDs, unread identity or hidden combat state reach controllers.

`agent_api.c: tremor_agent_step` / `player_interface.ts: ACTION_IDS` append four
constant macros: left/right 45-degree turns and forward+left/right 10-degree
turns. All 40 IDs cost seven tics and are legal regardless of geometry/identity.
These are combinations of controls humans already have.
