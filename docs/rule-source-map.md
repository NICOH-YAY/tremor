# Current rule/source map - 2026-10-31

Legend: code=inherited executable rule; manual=player-facing manual;
observed=measured evidence, not guarantee; assumed=declared equivalence/approximation;
design=original adaptation, rationale DESIGN.md / DECISIONS.md. Locators file+symbol.
Upstream engine locators below are in engine/doomgeneric/doomgeneric/.

| Rule | Label | Numbers/behavior | Locator |
|---|---|---|---|
| Timing | code |35Hz | doomdef.h TICRATE;g_game.c G_Ticker |
| Movement/collision | code | forward 25/run 50,strafe 24,step 24 units | g_game.c G_BuildTiccmd;p_user.c P_MovePlayer;p_map.c P_TryMove |
| Health/armor | code | stim 10/medkit 25 cap 100;bonuses/spheres cap 200;armor absorbs 1/3 or 1/2 | p_inter.c P_TouchSpecialThing/P_GiveBody/P_DamageMobj |
| Weapons/missiles/AI | code | inherited state-tic/damage tables | info.c states/mobjinfo;p_pspr.c A_*;p_enemy.c A_Chase/P_NoiseAlert;p_map.c P_LineAttack/P_RadiusAttack |
| Keys/exits/hazards | code | key specials 26/27/28/32/33/34 etc;exit 11/51/52/124 | p_doors.c EV_DoLockedDoor;p_switch.c P_UseSpecialLine;p_spec.c P_CrossSpecialLine/P_PlayerInSpecialSector;g_game.c G_DoCompleted |
| Controls/player manual | manual | exact control/channels | docs/RULES.md;index.html how-to-play |
| Freedoom-for-Doom data | assumed | engine rules equivalent, layouts/art differ | engine/UPSTREAM.md;public/wad/FREEDOOM-LICENSE.txt |
| Observation FOV | assumed |90degree horizontal cone+LOS approximates screen knowledge | agent_api.c tremor_agent_observe/discover |
| Crew fraction | observed |90/256=35.15625% full RNG threshold; not exact each map | tremor.c TR_MapSpawn;seed tests |
| CPU cost | observed | measured scope excludes Canvas/audio | review-response-2026-10-31.md;engine/build/session-*-browser.json |
| TR_CREW_THRESHOLD | design | `90` P_Random byte <90: 35.16% of POSS/SPOS. | `engine/tremor/tremor.h TR_CREW_THRESHOLD`; `tremor.c`; [rationale](DESIGN.md) |
| TR_READ_TICS | design | `35` Continuous crosshair identification. | `engine/tremor/tremor.h TR_READ_TICS`; `tremor.c`; [rationale](DESIGN.md) |
| TR_STUN_TICS | design | `70` Same freeze for either human identity. | `engine/tremor/tremor.h TR_STUN_TICS`; `tremor.c`; [rationale](DESIGN.md) |
| TR_STUN_COOLDOWN | design | `35` Prevent indefinite stun by holding F. | `engine/tremor/tremor.h TR_STUN_COOLDOWN`; `tremor.c`; [rationale](DESIGN.md) |
| TR_PURGE_TICS | design | `35` Uninterrupted close contact. | `engine/tremor/tremor.h TR_PURGE_TICS`; `tremor.c`; [rationale](DESIGN.md) |
| TR_PURGE_CHARGES | design | `2` Reset each level. | `engine/tremor/tremor.h TR_PURGE_CHARGES`; `tremor.c`; [rationale](DESIGN.md) |
| TR_MAX_TRAUMA | design | `6` Episode lifetime; never displayed. | `engine/tremor/tremor.h TR_MAX_TRAUMA`; `tremor.c`; [rationale](DESIGN.md) |
| TR_HUMAN_HEAL | design | `15`  | `engine/tremor/tremor.h TR_HUMAN_HEAL`; `tremor.c`; [rationale](DESIGN.md) |
| TR_DEMON_HEAL | design | `10`  | `engine/tremor/tremor.h TR_DEMON_HEAL`; `tremor.c`; [rationale](DESIGN.md) |
| TR_HEALTH_CAP | design | `100`  | `engine/tremor/tremor.h TR_HEALTH_CAP`; `tremor.c`; [rationale](DESIGN.md) |
| TR_MELEE_MULTIPLIER | design | `10` Berserk-strength fists without a powerup. | `engine/tremor/tremor.h TR_MELEE_MULTIPLIER`; `tremor.c`; [rationale](DESIGN.md) |
| TR_SHOTGUN_GIB_THRESHOLD | design | `192` 75% at close range in hyper mode. | `engine/tremor/tremor.h TR_SHOTGUN_GIB_THRESHOLD`; `tremor.c`; [rationale](DESIGN.md) |
| TR_IMPACT_TICS | design | `6` Render-only melee shake duration. | `engine/tremor/tremor.h TR_IMPACT_TICS`; `tremor.c`; [rationale](DESIGN.md) |
| TR_SHOT_KICK_TICS | design | `3` Render-only firearm kick duration. | `engine/tremor/tremor.h TR_SHOT_KICK_TICS`; `tremor.c`; [rationale](DESIGN.md) |
| TR_KILL_FLASH_TICS | design | `8` Near kill red flash; not actual damage. | `engine/tremor/tremor.h TR_KILL_FLASH_TICS`; `tremor.c`; [rationale](DESIGN.md) |
| TR_AIM_UNIT | design | `16384` Binary angle units per random-byte delta / trauma. | `engine/tremor/tremor.h TR_AIM_UNIT`; `tremor.c`; [rationale](DESIGN.md) |
| TR_CLOSE_RANGE | design | `(128*FRACUNIT)` Kill flash / shotgun gib range. | `engine/tremor/tremor.h TR_CLOSE_RANGE`; `tremor.c`; [rationale](DESIGN.md) |
| TR_FEAR_RANGE | design | `(192*FRACUNIT)` Visible demons cause cowering. | `engine/tremor/tremor.h TR_FEAR_RANGE`; `tremor.c`; [rationale](DESIGN.md) |
| TR_GUN_FEAR_RANGE | design | `(512*FRACUNIT)` Nearby gunfire makes crew cower. | `engine/tremor/tremor.h TR_GUN_FEAR_RANGE`; `tremor.c`; [rationale](DESIGN.md) |
| TR_COWER_TICS | design | `35`  | `engine/tremor/tremor.h TR_COWER_TICS`; `tremor.c`; [rationale](DESIGN.md) |
| TR_BLOOD_MIN | design | `8`  | `engine/tremor/tremor.h TR_BLOOD_MIN`; `tremor.c`; [rationale](DESIGN.md) |
| TR_BLOOD_VARIATION | design | `9` Inclusive burst range 8..16. | `engine/tremor/tremor.h TR_BLOOD_VARIATION`; `tremor.c`; [rationale](DESIGN.md) |
| TR_READ | design | `1`  | `engine/tremor/tremor.h TR_READ`; `tremor.c`; [rationale](DESIGN.md) |
| TR_STUN | design | `2`  | `engine/tremor/tremor.h TR_STUN`; `tremor.c`; [rationale](DESIGN.md) |
| TR_PURGE | design | `4`  | `engine/tremor/tremor.h TR_PURGE`; `tremor.c`; [rationale](DESIGN.md) |
| TR_TERROR_RANGE | design | `(1024*FRACUNIT)`  | `engine/tremor/tremor.h TR_TERROR_RANGE`; `tremor.c`; [rationale](DESIGN.md) |
| TR_TERROR_CLOSE | design | `(256*FRACUNIT)`  | `engine/tremor/tremor.h TR_TERROR_CLOSE`; `tremor.c`; [rationale](DESIGN.md) |
| TR_TERROR_SCAN | design | `8` At most eight LOS tests per player tic. | `engine/tremor/tremor.h TR_TERROR_SCAN`; `tremor.c`; [rationale](DESIGN.md) |
| TR_TERROR_DECAY | design | `350` One point after ten seconds without exposure. | `engine/tremor/tremor.h TR_TERROR_DECAY`; `tremor.c`; [rationale](DESIGN.md) |
| TR_AMMO_KEEP | design | `64` 64/256 map ammunition survives. | `engine/tremor/tremor.h TR_AMMO_KEEP`; `tremor.c`; [rationale](DESIGN.md) |
| TR_HIT_LOSS | design | `179` At terror 100: 77/256 = 30.08% successful rolls. | `engine/tremor/tremor.h TR_HIT_LOSS`; `tremor.c`; [rationale](DESIGN.md) |
| TR_DAMAGE_EXTRA | design | `6` 0..60 percent extra incoming damage. | `engine/tremor/tremor.h TR_DAMAGE_EXTRA`; `tremor.c`; [rationale](DESIGN.md) |
| TR_RADIO_COOLDOWN | design | `3150` Ninety seconds, episode clock. | `engine/tremor/tremor.h TR_RADIO_COOLDOWN`; `tremor.c`; [rationale](DESIGN.md) |
| TR_AMMO_DROP | design | `31` 31/256 deaths drop one round. | `engine/tremor/tremor.h TR_AMMO_DROP`; `tremor.c`; [rationale](DESIGN.md) |
| Fear | design | +1/body or+2 fresh<70 tics/close<256;cap 100;all humans equal;+/-45cone | tremor.c corpses;RULES.md |
| Fear effects | design | buckets<25/<50/<80/otherwise;hit 256 to 77/256;damage 1.0 to 1.6x | TR_TerrorBucket/TR_Hit/TR_Damage |
| Decay/carry | design |1/350 tics without exposure;halve on entry | corpses/TR_LevelStart |
| Ammo | design | hostile count+1;drop 1/small 2/box 4;31/256 death drops;64/256 map keep;+3purge | TR_LevelStart/TR_Kill/TR_Ammo;p_inter.c P_GiveAmmo |
| Purge | design | full 35 tics spends 1, reveals crew,+3either identity;interrupt equal | TR_PlayerThink/TR_Damaged;tests/agent.test.ts full channel |
| Kill effects | design | human trauma+1 cap 6;heal 15/10 below 100 only | TR_Kill/TR_Aim;p_inter.c P_DamageMobj |
| Pitch | design | +/-32 degrees, aimed interactions match shots | TR_PlayerThink/crosshair/TR_PitchSlope;p_map.c P_LineAttack |
| Map | design |257x257,16 unit cells;shared D/d/S/T,b/y/r;no secret markers | agent_api.c automap/discover;am_map.c AM_drawWalls |
| Route | design |16 unit lattice,256 unit waypoint,secret barriers;near<128/nearby<512/far | route_update/TR_StoryTick/TR_ObjectiveDistance |
| Radio/save | design |16KB transcript,once/map briefing,3150 tic cooldown;Tremor 3;partial channels reset | TR_QueueRadio/TR_Radio/TR_StoryStart;p_saveg.c |
| Runner | design |600 actions/calls,7 tics,20s/call,300s total,K8/obs-only;exit 100else0 | runner.ts runEpisode;agent_api.c |
| UI/effects | design |320x200 at 4:3;pre-scale<=3;story 4Hz | engine-page.js;horror.js;settings-store.js;DESIGN.md |

##40-action ABI

All rows 7 tics;turns fine 2/small 10/medium 45/large 90 degrees. Compound holds both inputs.

| ABI | Action | Tics |
|---|---|---|
| 0 | `forward` | 7 |
| 1 | `back` | 7 |
| 2 | `strafe_left` | 7 |
| 3 | `strafe_right` | 7 |
| 4 | `turn_left_small` | 7 |
| 5 | `turn_left_large` | 7 |
| 6 | `turn_right_small` | 7 |
| 7 | `turn_right_large` | 7 |
| 8 | `fire` | 7 |
| 9 | `use` | 7 |
| 10 | `read` | 7 |
| 11 | `stun` | 7 |
| 12 | `purge` | 7 |
| 13 | `wait` | 7 |
| 14 | `weapon_fist` | 7 |
| 15 | `weapon_pistol` | 7 |
| 16 | `weapon_shotgun` | 7 |
| 17 | `turn_left_fine` | 7 |
| 18 | `turn_right_fine` | 7 |
| 19 | `forward_slow` | 7 |
| 20 | `advance_fire` | 7 |
| 21 | `strafe_left_fire` | 7 |
| 22 | `strafe_right_fire` | 7 |
| 23 | `back_fire` | 7 |
| 24 | `sprint` | 7 |
| 25 | `turn_left_small_fire` | 7 |
| 26 | `turn_right_small_fire` | 7 |
| 27 | `turn_left_fine_fire` | 7 |
| 28 | `turn_right_fine_fire` | 7 |
| 29 | `turn_left_small_read` | 7 |
| 30 | `turn_right_small_read` | 7 |
| 31 | `turn_left_fine_read` | 7 |
| 32 | `turn_right_fine_read` | 7 |
| 33 | `advance_read` | 7 |
| 34 | `approach_left_fire` | 7 |
| 35 | `approach_right_fire` | 7 |
| 36 | `turn_left_medium` | 7 |
| 37 | `turn_right_medium` | 7 |
| 38 | `advance_left` | 7 |
| 39 | `advance_right` | 7 |
