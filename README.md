# Tremor browser engine bring-up

The default page now runs the GPL Doom engine via doomgeneric, with freely redistributable Freedoom Phase 1 data. Select **Play (Freedoom)** or **Load your DOOM WAD** (local only). No proprietary id game data is shipped. Music is currently silent; DMX sound effects use Web Audio. No Tremor moral modifications have been applied to the engine yet.

See [engine/BUILD.md](engine/BUILD.md) for build/deploy instructions, verification limits and TODOs; [engine/UPSTREAM.md](engine/UPSTREAM.md) and [engine/PATCHES.md](engine/PATCHES.md) for provenance and the isolated platform override. Source and license must accompany GPL binary distribution. The earlier design below describes the retained TypeScript evaluation sim, not the new default player.

---

# TREMOR

**The gun works perfectly. The person holding it doesn't.** Tremor is an original browser shooter built around Doom's aim, shoot, survive loop. Unknown figures can be read before firing, infected crew can be stunned and purged, and shooting crew leaves permanent aim drift. Violence restores health; mercy costs time. There is no morality meter or judgement screen.

## Play

Node 24+ and npm are required. In PowerShell use `npm.cmd` if script execution policy blocks `npm`.

```sh
npm ci
npm run dev
```

Open http://localhost:5191 and click **Click to begin**. Reach the lift in Hangar, continue through Quarantine, then return to the title. Follow the radio and find the red/blue keycards; walk into the green EXIT beacon beyond the keyed door. Death offers **Try again**, restoring the level's entry state. Supplies reset between story levels, while trauma carries through the story.

| Control | Action |
| --- | --- |
| WASD | Move and strafe, running by default |
| Mouse / left and right arrows | Turn; mouse uses pointer lock |
| Left click / Ctrl | Fire shotgun |
| Right click / R (hold) | Read an aimed figure; arc fills, then an identity briefly appears |
| F | Stun a nearby possessed figure |
| Q (hold at close range) | Purge a stunned figure; takes one second and a charge, damage interrupts |
| E (press) | Open a door; toggle B-2 sealing (unsealing opens it) |
| Esc | Pause: resume, mouse sensitivity, restart level, quit to title |

Sensitivity is saved locally. Medkits (white/red), ammunition (gold), and purge charges (cyan) are collected by walking over them. Reading works within ten tiles, faster close up and in light. Crew flee danger; they do not follow you. No jumping or vertical aiming. Demonstration levels are accessible only through `?level=s1_corridor`, `s2_collar`, `s3_triage`, `h1_dark`, `h2_door` (also `hangar` / `quarantine`).

## Scope

Included: **two original story levels and five evaluation situations**, three enemy types (hitscan Possessed, projectile Ember, melee Hound) plus crew; momentum, collision, keyed doors, pickups, seeded combat, pain interruption, infighting and sound alerts. Recognition, trauma, temptation, mercy, collars and sealing inject the design constraint into combat. A CPU Canvas 2D raycaster supplies lighting, fog, sprites, bob and recoil, with original procedural spatial audio.

Deliberate exclusions relative to Doom:

| Excluded | Reason |
| --- | --- |
| Vertical geometry, different floor heights, pitch | A bounded grid raycaster keeps collision and CPU rendering small and deterministic. |
| Weapons beyond shotgun and stun; BFG, rockets and weapon inventory | One lethal tool and one mercy tool keep the choice legible. The shotgun is a single 40-damage ray with an eight-tic cycle, not Doom's seven-pellet shotgun. |
| Multiplayer | The experiment and story concern one player; network synchronization is outside scope. |
| WAD support | Original typed maps avoid a compatibility engine and external game data. |
| Original Doom levels/assets | Layouts, implementation, audio and art here are original; no id or Freedoom data is shipped. |
| Full Doom AI/physics, inventory and door timing | Roles are reconstructed with explicit adaptations, not a binary-compatible engine. |

## Verify and evaluate

```sh
npm test
npm run typecheck
npm run build
npm run eval
npm run eval -- --players baseline_careful,baseline_aggressive --cases hangar,quarantine,s1_corridor,s2_collar,s3_triage,h1_dark,h2_door
```

`npm run eval` runs baselines on the declared five-case suite, seeds 17/83, and explicitly skips live models. Reports go to `eval/results`, per-action traces to `eval/traces`. Limits: 400 actions, 400 controller calls, 20 seconds per call; each action advances seven 35-Hz tics. The five operations and constant action vocabulary are documented in [CONTRACTS](docs/CONTRACTS.md). Model players see observations and legal IDs only.

For paid live trials, configure Application Default Credentials for Vertex AI first. PowerShell example:

```powershell
$env:GOOGLE_CLOUD_PROJECT='your-project'
$env:GOOGLE_CLOUD_LOCATION='global'
# Optional for a service account: path to an existing credential file
$env:GOOGLE_APPLICATION_CREDENTIALS='C:\path\credentials.json'
npm run eval:live
```

Live model: `gemini-3.5-flash-lite`; global availability failures count toward the call budget before a subsequent regional attempt. History and observation-only variants are separate players. No live results are claimed by the integration checks. Prices remain unverified/null in reports. See [evaluation plan](docs/EVALUATION-PLAN.md) and [decisions](docs/DECISIONS.md).

`tests/baseline.test.ts` checks completion on both seeds across all seven levels. `tests/performance.test.ts` checks a 480x270 software raster frame plus simulation below 6 ms averaged per level, excluding browser canvas upload/DOM/audio. Recorded integration evidence is in [baseline results](eval/integration-baselines.json) and [performance results](eval/integration-performance.json). Browser smoke coverage mocks canvas; actual pointer lock, audio and visual quality require browser verification.

## Credits and reuse

Creative direction: Nicoh. Original TypeScript implementation integrated with Codex. Rules reconstructed from id Software's [DOOM source release](https://github.com/id-Software/DOOM/tree/master/linuxdoom-1.10), cited, **not copied**. The upstream source is under [GPL-2.0](https://github.com/id-Software/DOOM/blob/master/LICENSE.TXT); its source license does not grant rights to Doom game data. Preserve upstream notices and follow that license when reusing upstream code. Tremor ships none of that code or data. Freedoom is not used. Hideous Destructor and Total Chaos are inspiration only; no code or assets are included from either.

Higgsfield-generated art provenance and the author's terms check are recorded in [public/art/CREDITS.md](public/art/CREDITS.md). Procedural audio, layouts, fallback graphics and implementation are original. No general redistribution license for Tremor's own code/art is declared yet; obtain the author's permission for reuse. Do not infer that the upstream GPL licenses these independent files.

See [design](docs/DESIGN.md), [rule/source map](docs/rule-source-map.md), [Doom research](docs/research/doom-rules.md), [contracts](docs/CONTRACTS.md), [decisions](docs/DECISIONS.md), and [rubric checklist](docs/RUBRIC-CHECKLIST.md). CI runs tests/typecheck; Pages builds on pushes to main with relative asset URLs. Enable GitHub Pages with GitHub Actions as its source to deploy.
