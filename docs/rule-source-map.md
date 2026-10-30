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
