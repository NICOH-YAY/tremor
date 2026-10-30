# Doom rules reference for Tremor

Purpose: Doom rules Tremor reconstructs, each with an evidence label and a locator, for filling `docs/rule-source-map.md`. Numbers are paraphrased from the id Software release; no code is copied.

Read 2026-10-30. Labels: code = read in the id source; manual = original manual; observed = community/wiki measurement; derived = computed by us from code values; recalled = I know it from the source but did not re-verify it on a page this session (integrator should spot-check before citing as code).

Base for locators: `https://github.com/id-Software/DOOM/blob/master/linuxdoom-1.10/<file>` (abbrev. `L/<file>`). Line numbers were not available from the fetch tool, so locators give file + function/table. Add line numbers when citing, from the GitHub view.

Caveats:
- doomwiki.org returned HTTP 403 to the fetcher, so wiki facts come from search-result snippets and are labelled observed with lower confidence.
- The original manual was not fetched. No row is labelled manual.

## 1. Licensing and credits

| Item | Fact | Label | Locator |
|---|---|---|---|
| Source release | linuxdoom-1.10 released 23 Dec 1997 under the non-commercial DOOM Source Code License. | observed | https://doomwiki.org/wiki/Doom_source_code (via search snippet) |
| Re-license | id re-licensed it under GPL v2 on 3 Oct 1999. The GitHub repo shows "GPL-2.0" and contains `LICENSE.TXT`. Source file headers still carry the old 1993-1996 id notice. | code + observed | https://github.com/id-Software/DOOM (root: `LICENSE.TXT`, `README.TXT`) |
| What GPL covers | Code only. The IWAD, art, sound and music are not released. Tremor ships none of them. | observed | `README.TXT` (game data must come from a copy of Doom) |
| Credit line | "Rules reconstructed from id Software's DOOM source release (linuxdoom-1.10, GPL v2, (c) id Software / ZeniMax Media). No id code or assets included." | design | n/a |
| Freedoom | BSD-style license. Credit requirement: keep the copyright statement and credit the Freedoom project. Full text: `COPYING.adoc`. Use only if Tremor ships Freedoom assets (DESIGN says all assets are original, so likely n/a). | code/observed | https://freedoom.github.io/about.html ; https://github.com/freedoom/freedoom/blob/master/COPYING.adoc |

## 2. Time, player movement

| Rule | Value / behaviour | Label | Locator | Tremor use / adaptation |
|---|---|---|---|---|
| Tic rate | 35 tics/s, fixed step. | code | `L/doomdef.h` `#define TICRATE 35` | Fixed-step sim at 35 Hz, interpolated render. Exact. |
| Move input | Walk forward 25, run forward 50, walk side 24, run side 40. Clamp at 50 (`MAXPLMOVE = forwardmove[1]`). | code | `L/g_game.c` tables `forwardmove[]`, `sidemove[]`, `G_BuildTiccmd` | Use the run values as the default speed (Doom players run). Keep both walk and run. |
| Turn input | Turn rates 640 (normal), 1280 (run), 320 (slow) per tic in BAM-ish units. Slow turn for the first 6 tics of key hold (`SLOWTURNTICS`). | code | `L/g_game.c` `angleturn[]`, `SLOWTURNTICS`, `G_BuildTiccmd` | Keyboard-turn fallback copies the slow-then-fast ramp. Mouse look is an adaptation (Doom mouse X turns by `mousex*8`, mouse Y moves forward). |
| Thrust | On the ground only, `P_Thrust` adds `forwardmove*2048` along facing and `sidemove*2048` at 90 degrees to momentum (fixed point, 65536 = 1 unit). Run forward adds about 1.56 units/tic/tic. | code | `L/p_user.c` `P_MovePlayer`, `P_Thrust` | Same acceleration model: input adds momentum, no direct velocity set. |
| Friction | Each tic, momentum x and y are multiplied by 0xe800/65536, which is about 0.906. Momentum is zeroed under `STOPSPEED` 0x1000 (about 0.06 units/tic) when no input. Momentum is clamped to 30 units per axis (`MAXMOVE`). | code | `L/p_mobj.c` `P_XYMovement`, `FRICTION`, `STOPSPEED`; `L/p_local.h` `MAXMOVE` | Use 0.90625 per tic and the same stop threshold. |
| Top speed | Terminal speed from thrust/(1-friction): about 16.7 units/tic running forward, about 14.2 for pure strafe at 40. Strafe-running (forward 50 + side 40) gives about 21.3 (28% faster than running). | derived (code values) + observed | Derivation from the two rows above; Doomworld analysis https://www.doomworld.com/forum/post/1015471 (via search snippet) | Strafe-running is allowed and not nerfed. This is what gives the Doom feel. Do not clamp diagonal speed. |
| Diagonal engine quirk | Forward and side thrust add as vectors with no normalisation. Speed runs (SR40/SR50) exploit it. The wiki's 70.7 units/tic figure ignores friction. | observed | https://doomwiki.org/wiki/SR50 (search snippet, conflicting figure noted) | Keep unnormalised thrust (cheap, faithful). Do not copy the SR50 numbers. |
| Player size | Radius 16, height 56, eye height 41 (`VIEWHEIGHT`). | code | `L/info.c` MT_PLAYER; `L/p_local.h` `PLAYERRADIUS`, `VIEWHEIGHT` | Circle collider of radius 16 on a map where 1 unit is Doom's. |
| Wall sliding | A blocked move traces and slides along the wall (`P_SlideMove`), up to 3 retries, then a stairstep fallback (try y, then x). | code | `L/p_map.c` `P_SlideMove` | Axis-separated slide on the grid. Simplified. |
| Use range | 64 units trace along facing; first special line hit is activated. A blocking non-special line plays an "oof". | code | `L/p_local.h` `USERANGE`; `L/p_map.c` `P_UseLines` | Use key reaches 64 units. |
| Start stats | 100 health, 50 clip bullets, pistol and fist. | recalled | `L/g_game.c` `G_PlayerReborn` | Tremor start: 100 health, pistol, ammo per level design. |
| Health cap | 100 normal. Bonus items go to 200. | code | `L/p_local.h` `MAXHEALTH`; `L/p_inter.c` `P_GiveBody`, `P_TouchSpecialThing` | Cap 100 (Tremor has no bonus items). |

## 3. Hitscan weapons

| Rule | Value / behaviour | Label | Locator | Tremor use / adaptation |
|---|---|---|---|---|
| Pistol damage | 5, 10 or 15 per bullet: `5*(P_Random()%3+1)`. One ammo per shot. | code | `L/p_pspr.c` `A_FirePistol`, `P_GunShot` | Same distribution via our seeded RNG. |
| Pistol spread | The first shot of a trigger pull is perfectly accurate. While held (`refire` > 0) each shot gets a horizontal error `(P_Random()-P_Random())<<18`, a triangular spread of about +/-5.6 degrees. | code + derived | `L/p_pspr.c` `A_FirePistol` (`!player->refire`), `P_GunShot`, `A_ReFire` | Direct. Tremor adds trauma tremor on top, which widens the same spread term. |
| Shotgun | 7 pellets, each damage `5*(P_Random()%3+1)`, each with the same spread, 1 shell. | code | `L/p_pspr.c` `A_FireShotgun` | Shotgun is optional scope. Use these numbers if included. |
| Autoaim / slope | `P_BulletSlope` autoaims vertically at range 1024 (16*64). If nothing is found it retries at +/-90 degrees (`1<<26`) to catch targets slightly off-axis. In `PTR_AimTraverse` the aim slope is the middle of the target's visible vertical window. | code | `L/p_pspr.c` `P_BulletSlope`; `L/p_map.c` `P_AimLineAttack`, `PTR_AimTraverse` | A 2.5D raycaster has no pitch, so vertical autoaim is moot. Keep the horizontal "nearby target within aim cone" assist, a design adaptation. |
| Hit range | Bullets travel `MISSILERANGE` = 2048 units. | code | `L/p_local.h` `MISSILERANGE`; `P_GunShot` | Hitscan max range 2048. |
| Pistol cycle | `S_PISTOL1` 4 tics, `S_PISTOL2` 6 (fires), `S_PISTOL3` 4, `S_PISTOL4` 5 (`A_ReFire`), so 19 tics between shots (about 1.8 shots/s). | code | `L/info.c` states `S_PISTOL1..4` | Fire interval 19 tics. Flash `S_PISTOLFLASH` 7 tics. |
| Shotgun cycle | Tics 3,7(fires),5,5,4,5,5,3,7 = 44 tics (about 0.8 shots/s). | code | `L/info.c` `S_SGUN1..9` | Same, if included. |
| No reload | Weapons have no reload state. Ammo is removed per shot and the weapon returns to ready. | code | `L/p_pspr.c` `A_FirePistol`, `A_ReFire`, `P_CheckAmmo` | No reload in Tremor either. Scarcity comes from ammo and the purge charge. |
| Weapon sway | Ready-weapon bob: `x = 1 + bob*cos(128*leveltime)`, `y = WEAPONTOP + bob*sin(...)` over fine angles. | code | `L/p_pspr.c` `A_WeaponReady` | Weapon sprite sway driven by player bob. |

## 4. Enemy stats (from the mobjinfo table)

| Stat | Zombieman (Possessed) | Imp (Ember) | Demon / pinky (Hound) | Label | Locator |
|---|---|---|---|---|---|
| Health | 20 | 60 | 150 | code | `L/info.c` `mobjinfo[MT_POSSESSED / MT_TROOP / MT_SERGEANT]` `spawnhealth` |
| Reaction time (tics) | 8 | 8 | 8 | code | same, `reactiontime` |
| Pain chance (x/256) | 200 | 200 | 180 | code | same, `painchance` |
| Speed (units per `A_Chase` step) | 8 | 8 | 10 | code | same, `speed` |
| Radius / height / mass | 20/56/100 | 20/56/100 | 30/56/400 | code | same |
| Melee state | none | yes | yes | code | same, `meleestate` |
| Missile state | hitscan attack | fireball | none | code | same, `missilestate` |
| Attack wind-up | 10 tics face target, then fire at tic 11 (state tics 10, 8, 8) | 8, 8 then fire (8, 8, 6) | 8, 8 then bite (8, 8, 8) | code | `L/info.c` `S_POSS_ATK1..3`, `S_TROO_ATK1..3`, `S_SARG_ATK1..3` |
| Pain state length | 3 + 3 tics | n/a | n/a | code | `L/info.c` `S_POSS_PAIN`, `S_POSS_PAIN2` |
| Approx. ground speed per tic | about 2 (8 per 4-tic run frame) | about 2.7 (8 per 3 tics) | about 5 (10 per 2 tics) | recalled (run-frame tic counts 4/3/2 not re-fetched) + code `speed` | `L/info.c` `S_POSS_RUN*`, `S_TROO_RUN*`, `S_SARG_RUN*` |
| Attack damage | hitscan `3*(P_Random()%5+1)` = 3..15 | claw `3*(P_Random()%8+1)` = 3..24; fireball base damage 3 times `(P_Random()%8+1)` = 3..24 | bite `4*(P_Random()%10+1)` = 4..40 | code | `L/p_enemy.c` `A_PosAttack`, `A_TroopAttack`, `A_SargAttack`; fireball: `L/p_map.c` `PIT_CheckThing` |
| Hitscan spread | monster angle error `(P_Random()-P_Random())<<20`, about +/-22 degrees (wider than the player's) | n/a | n/a | code + derived | `L/p_enemy.c` `A_PosAttack` |
| Fireball | speed 10 units per tic, radius 6, height 8, spawns 32 units above the imp's feet, aimed at the target with a vertical momentum fix | | | code | `L/info.c` MT_TROOPSHOT; `L/p_mobj.c` `P_SpawnMissile` |
| Melee range | 64 units adjusted by target radius, needs line of sight | | | code | `L/p_local.h` `MELEERANGE`; `L/p_enemy.c` `P_CheckMeleeRange` |

Tremor use: Possessed, Ember and Hound take these roles with numbers rounded or retuned per DESIGN. Note the Ember "flees when alone" and the Hound "collar frees it" are design rules, not Doom rules.

## 5. Monster AI

| Rule | Behaviour | Label | Locator | Tremor use / adaptation |
|---|---|---|---|---|
| Idle look | `A_Look` runs while the monster is idle. It clears `threshold`. If the sector's `soundtarget` is shootable it becomes the target (ambush monsters also need `P_CheckSight`). Otherwise `P_LookForPlayers(actor, false)` looks for a visible player. On acquiring a target it plays a see sound (random among variants `P_Random()%3`) and enters the see (chase) state. | code | `L/p_enemy.c` `A_Look` | Idle state with the same two triggers: heard noise, or sees player. |
| Sight cone | `P_LookForPlayers` checks at most 2 players per call, skips dead players and players without line of sight. Non-all-around mode ignores a player in the rear 180 degrees (more than 90 degrees from facing) unless within `MELEERANGE` (64). | code | `L/p_enemy.c` `P_LookForPlayers` | Forward 180 degree sight, plus a 64-unit "behind me" reaction. This is the sneak mechanic. |
| Sound alert | `P_NoiseAlert(target, emitter)` bumps `validcount`, then `P_RecursiveSound(sector, 0)` floods through connected sectors. It marks each sector's `soundtarget`. It does not wake monsters directly: each monster reads the flag in `A_Look`. | code | `L/p_enemy.c` `P_NoiseAlert`, `P_RecursiveSound` | Sector graph flood on gunfire. Same lazy "mark sector, monsters poll" model. |
| Sound blocking | The flood only crosses two-sided lines whose opening is greater than 0, so closed doors stop it. Lines flagged `ML_SOUNDBLOCK` let the flood cross at most one such line (`soundblocks` goes 0 to 1, stops at the second). | code | `L/p_enemy.c` `P_RecursiveSound` | Closed doors block noise. Sound-block flag on a few walls. Opening a door lets the noise through. |
| Who makes noise | The player firing a weapon calls `P_NoiseAlert`. Monsters also wake when hit (target switch). | code | `L/p_pspr.c` `P_FireWeapon` (noise alert on fire); recalled for exact call site | Gunfire alerts (DESIGN rule 5). Sneaking (not firing) avoids it. |
| Reaction time | Counts down 1 per `A_Chase` call (8 calls = a few dozen tics). The monster will not shoot while it is nonzero. Taking damage resets it to 0 so the monster fights back at once. | code | `L/p_enemy.c` `A_Chase`, `P_CheckMissileRange`; `L/p_inter.c` `P_DamageMobj` | The grace period after a monster wakes. |
| Chase step | Each `A_Chase` call: count down timers, turn toward `movedir` in 45-degree steps, return to idle if the target is gone, try melee (if in range), try missile (if allowed), else move 1 step. Step length is `info->speed`. `movecount` (random 0..15 after a successful step) forces a direction re-pick when it runs out. | code | `L/p_enemy.c` `A_Chase`, `P_Move`, `P_TryWalk` | Grid chase with 8 directions. |
| Direction choice | `P_NewChaseDir` tries the diagonal toward the target, then the two axis components, then the old direction, then a random sweep of all directions. It does not reverse unless it has to. It can open doors it bumps into. | code | `L/p_enemy.c` `P_NewChaseDir`, `P_Move` | Same preference order. Simplified door-open logic. |
| Attack decision | `P_CheckMissileRange`: needs sight. A just-hit monster fires immediately. Else blocked while reactiontime is nonzero. Distance minus 64, minus another 128 if it has no melee attack (so ranged-only monsters shoot from farther), converted to units, capped at 200. It fires only if `P_Random()` >= that distance. So hit chance falls off with distance: at 200+ units it is about 22% per check, at close range it is nearly 100%. | code | `L/p_enemy.c` `P_CheckMissileRange` | Direct. This is a probability, not a fixed range, so it is the main source of "feels alive". |
| No double attack | After a missile attack `MF_JUSTATTACKED` is set. On the next `A_Chase` it is cleared and the monster only re-picks a direction (except Nightmare/fast). Below Nightmare, a monster with `movecount` > 0 skips the missile check on that step. | code | `L/p_enemy.c` `A_Chase` | Gives the pauses between volleys. |
| Pain | In `P_DamageMobj`, `P_Random() < painchance` puts the monster into its pain state and sets `MF_JUSTHIT`, interrupting an attack. Pain state is about 6 tics for the zombieman. | code | `L/p_inter.c` `P_DamageMobj`; `L/info.c` painchance, `S_*_PAIN` | Stagger: 200/256 (78%) for Possessed and Ember, 180/256 (70%) for Hound. |
| Infighting | When a monster is damaged by another thing (not an Archvile), and it has no `threshold` (or the attacker is non-Archvile), it retargets to the attacker with `threshold = BASETHRESHOLD` (100 tics) and enters its chase state. While `threshold` is nonzero it keeps the new target and does not go back to the player. | code | `L/p_inter.c` `P_DamageMobj`; `L/p_local.h` `BASETHRESHOLD`; `A_Chase` threshold countdown | The Hound-collar mechanic: a freed Hound's damage to Embers makes them retarget it. Exception to copy: same-species fireballs pass or fizzle (Knight/Baron pair, and same type) with no damage. |
| Monster hits ignore players? | Missiles from the same type of monster explode without damage on each other. Players are still hit. | code | `L/p_map.c` `PIT_CheckThing` | Embers do not infight each other by fireball. |
| Fireball collision | Missile damage is rolled when it hits: `(P_Random()%8+1) * damage`. | code | `L/p_map.c` `PIT_CheckThing` | Embers: 3..24. Dodgeable at speed 10 units/tic (about 350 units/s). |

## 6. Doors, keys, exit, pickups

| Rule | Behaviour | Label | Locator | Tremor use / adaptation |
|---|---|---|---|---|
| Door speed and wait | Normal door opens at 2 units/tic (`VDOORSPEED`), waits 150 tics (about 4.3 s) at the top (`VDOORWAIT`), then closes. Blazing doors use 4x speed. Top is the lowest neighbouring ceiling minus 4. | code | `L/p_spec.h` `VDOORSPEED`, `VDOORWAIT`; `L/p_doors.c` `T_VerticalDoor`, `EV_VerticalDoor` | A 128-high door opens in about 64 tics. Use 2 units/tic and a 150-tic wait. |
| Keyed doors | `EV_DoLockedDoor` (tagged remote switch) and `EV_VerticalDoor` (door in front of you) check `player->cards[]`. Blue (specials 26/32 manual, 99/133 locked), yellow (27/34, 136/137), red (28/33, 134/135). A card or the matching skull key both work. Missing key: message, "oof" sound, the door does not move. | code | `L/p_doors.c` `EV_DoLockedDoor`, `EV_VerticalDoor`; `L/doomdef.h` `card_t` | Red key (level 1) and blue key (level 2). One key per colour, no skulls. Message "You need a red key". |
| Close rule | Only the player may close a door by use. Monsters can open but never close. | code | `L/p_doors.c` `EV_VerticalDoor` ("bad guys never close doors") | Doors auto-close after the wait. Monsters open them. |
| Exit | Using a switch of type exit calls `G_ExitLevel` and ends the level. | recalled | `L/p_switch.c` `P_UseSpecialLine` (special 11), `L/g_game.c` `G_ExitLevel` | Exit switch on the final wall of each level. |
| Stimpack | +10 health, only if health < 100, capped at 100. | code | `L/p_inter.c` `P_GiveBody`, `P_TouchSpecialThing` | Small medkit. |
| Medikit | +25 health, same rule. | code | same | Large medkit. Also the "shared medkit" of level 2. |
| Armor | Green armor gives 100 points and absorbs 1/3 of damage. Blue gives 200 and absorbs 1/2. Refused if you already have at least that many points. Armor depletes by the absorbed amount. | code | `L/p_inter.c` `P_GiveArmor`, `P_DamageMobj` | Optional. One armor type is enough. |
| Ammo pickup | Clip = 10 bullets, pistol-dropped clip = 5 (half). Ammo cap 200 bullets (no backpack). | code | `L/p_inter.c` `P_GiveAmmo` (clipammo = 10, 4, 20, 1; maxammo = 200,50,300,50) | Monster drop is half a clip (matches Doom: zombieman drops a clip flagged "dropped"). |
| Monster drops | Zombieman drops a clip on death. | code | `L/p_inter.c` `P_KillMobj` | Possessed drops ammo. Kills restoring health (DESIGN rule 3) is a design addition. |
| Damage and pain on the player | `P_DamageMobj` applies armor, then health. Damage count drives the red flash. Baby skill halves damage taken. | code | `L/p_inter.c` `P_DamageMobj` | Red screen flash scaled to damage. |

## 7. Random numbers

| Rule | Behaviour | Label | Locator | Tremor use / adaptation |
|---|---|---|---|---|
| M_Random table | A fixed 256-entry byte table `rndtable`. `P_Random()` increments an index (masked with 0xff) and returns `rndtable[index]`. It is not a PRNG: the same calls give the same sequence, which is how Doom demos stay in sync. | code | `L/m_random.c` `rndtable`, `P_Random`, `M_Random`, `M_ClearRandom` | We do not copy the table (it is a data table from the release). |
| Two cursors | `prndindex` (gameplay) and `rndindex` (menu/cosmetic) are separate, so cosmetic randomness cannot desync the game. | code | `L/m_random.c` | Tremor: two seeded streams, a `gameRng` for sim and a `fxRng` for cosmetics. Cosmetic calls never consume the sim stream. |
| Determinism | Tremor uses a seeded integer generator (e.g. mulberry32) in place of the table. Same seed + same action list gives the same episode. Required by `reset(seed)` and by replay tests. | design | DESIGN "Fixed-step deterministic sim" | Adaptation: sequence differs from Doom's, determinism is the same property. |
| Triangular error | `P_Random()-P_Random()` gives a bell-shaped error in -255..255, then shifted into an angle. | code | `L/p_pspr.c`, `L/p_enemy.c` | Use `rand8()-rand8()` for all spread. |

## 8. Intermission as "score"

| Rule | Behaviour | Label | Locator | Tremor use / adaptation |
|---|---|---|---|---|
| Stats | On level end `G_DoCompleted` copies per-player `killcount`, `itemcount`, `secretcount` and `leveltime` into the intermission data, plus level totals (`totalkills`, `totalitems`, `totalsecret`) and par time (`35 * par seconds`). | code | `L/g_game.c` `G_DoCompleted`; `L/wi_stuff.c` (the intermission screen, not read) | Tremor's `outcome()` score analogue: kills, items, time. The crew/demon kills are stored and shown plainly. No judgement text (DESIGN rule 6). |
| Where counted | Kills increment in `P_KillMobj`, items in `P_TouchSpecialThing`, secrets in the sector special handler. | recalled | `L/p_inter.c`, `L/p_spec.c` | Counts: kills (split crew vs demon), items, secrets if any, time in tics. |

## 9. Doom feel

What makes Doom's movement and combat fast and smooth, with sources:

- Momentum plus low friction. Run is 50 units of thrust, friction keeps 90.6% per tic, so you reach about 16.7 units/tic but stop within a few tics. Source: `g_game.c` tables, `p_mobj.c` `FRICTION`, derived (section 2).
- Strafe-running is not penalised, so diagonal movement is faster (about 28% over straight running). Source: Doomworld analysis and doomwiki SR40/SR50 pages (observed).
- No reload, no aim-down-sights delay: fire rate is the state-table cycle (pistol 19 tics, shotgun 44). Source: `info.c` states, `p_pspr.c` `A_ReFire`.
- First shot accurate, held fire sprays. Rewards tap-firing. Source: `p_pspr.c` `A_FirePistol` (`!player->refire`).
- Head bob capped at 16 units, driven by speed squared; weapon sway uses the same `bob` plus a time-based sine. Source: `p_user.c` `MAXBOB`, `P_CalcHeight`; `p_pspr.c` `A_WeaponReady`.
- Muzzle flash lights the room: `A_Light1` sets `extralight` for the 7-tic flash state. Source: `p_pspr.c`, `info.c` `S_PISTOLFLASH`.
- Monsters are fast and alert: a pinky covers about 5 units/tic, a gunshot wakes the whole connected area. Source: `info.c` speeds, `p_enemy.c` `P_NoiseAlert`.
- Instant feedback: pain state interrupts the attack, so shooting a monster is satisfying; the fireball is a visible, dodgeable object. Source: `p_inter.c` `P_DamageMobj`.
- Sound as information: see sounds, pain sounds, door sounds and the "oof" for a missing key (all cue state). Source: `p_enemy.c` `A_Look`, `p_doors.c` `EV_VerticalDoor`. Tremor uses original or generated sounds, not id's.
- Fixed 35 Hz logic means input to result is predictable, which suits an agent wrapper that steps in tics.

## 10. Items for the integrator to verify

- Run-frame tic counts for the three enemies (section 4 speed row), and the `P_FireWeapon` noise-alert call site.
- Exit switch special number and `G_ExitLevel` call (section 6).
- Starting ammo and health (`G_PlayerReborn`).
- Exact line numbers for all locators (fetcher gave file/function only).
- Manual-labelled rows: none exist yet. If a rule needs "manual", cite doomwiki's scan of the Doom manual or skip it.
