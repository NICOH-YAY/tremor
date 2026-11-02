You are Codex, the INTEGRATOR and merger for "Tremor" in D:\Coding VS\tremor (branch main). Read AGENTS.md, docs/CONTRACTS.md, docs/DESIGN.md, docs/RUBRIC-CHECKLIST.md. Three parallel worker branches (renderer, mechanics, content) and the agent-harness branch have been merged into main. Your job: make the whole thing one coherent, FUN, SMOOTH, complete game that a human can play start to finish in a browser, without breaking tests. You may edit any file now (you are integrator).

Integration notes from the workers (do all of these):
## From content worker (feat/content @2df3d79)
- Pass source position to audio.play; map event types: door->door, pickup->pickup, radio->radio, fire->shotgun, playerHurt->hurt, cured->purge; stun/alerts/fireball names from mechanics events.
- Sealing: use on a sealable door toggles d.sealed=true (close first), emit door event. Nothing sets sealed today.
- Pickups: core must consume kind:'pickup' entities with data.item medkit|ammo|purge (and keys).
- Closet: hound data.closet:'red', its door sealed:true; on red key pickup (trigger closet_red) unseal+open door, alert hound.
- map.light per cell must be read by renderer.
- Secret alcove is a plain door (no secret wall support). Crew don't follow player.
- Verify quarantine B-2 orders fire in order.
## From renderer worker (feat/render @14860bd)
- main.ts must wire view: flash 0..1 decaying after fire; recoil 0..1 decaying; shake in internal px ~0..8 (on hurt/explosions); weaponSway ~-1..1 (from turn rate / strafe); bob = world.player.bob phase (renderer scales by speed).
- Renderer guesses pickup type from data.name|type|item|color|kind containing key/red/blue/medkit — content uses data.item; make consistent.
- Known: entity angle not interpolated; partly-open door shows floor through gap; weapon hand slightly cropped at right edge (shift weapon left a bit).
## From mechanics worker (feat/mechanics @bd215b9)
- Core target() must skip kind==='fireball' (player can shoot fireballs, bumps kills.demons).
- Add 'collarBreak' GameEvent type; mechanics currently emits {type:'hit', amount:0} for a break — switch to collarBreak.
- collar.ts refunds 40 dmg assuming core hitscan = 40; keep in sync (export a constant).
- Dead fireballs linger 8 tics; pruned only when an ember fires — core should prune dead fireballs after their linger.
- Monster-on-monster kills emit kill events without touching player counters.
- Known: greedy pathing, crew don't open doors, tuning unplaytested.

Then the game-level integration:
1. main.ts flow: Title screen uses art/title.jpg as a full-bleed background with "TREMOR" title text, a one-line tagline ("The gun works perfectly."), and controls list; click to begin -> level 'hangar' -> on exit show the level's endText on a plain intermission card (Doom-style intermission but NO kill/score stats; just the endText lines and "Continue") -> 'quarantine' -> final card -> back to title. Level select for the situation levels hidden behind ?level=<id> URL param (for demos/recording). Death: fade to dark red, "Try again" restarts the level from its start state.
2. Feel/smoothness: fixed 35Hz sim with interpolated rendering (already), mouse look via pointer lock with sensitivity setting (slider in pause menu, saved in localStorage), keyboard turn fallback, run by default. Wire view.flash/recoil/shake/weaponSway/bob as the renderer requires (decay curves per frame, not per tic, so they are smooth). Crosshair drawn on the overlay: thin cross; its jitter/drift amplitude scales with player.tremor (smooth noise, not random jumps) — this is the only expression of trauma. Read indicator: while holding read on a figure, a small arc fills around the crosshair; when revealed, a one-word label appears briefly ("crew" / "possessed" / "demon"). Pause menu on Esc with Resume / Sensitivity / Restart level / Quit to title. Show a brief radio subtitle line at the bottom when radio events fire. Pickup/hurt flashes. Make sure the canvas fills the window crisp (image-rendering: pixelated) and resizes.
3. Audio: call audio.play for every event with positions; footsteps while moving.
4. Ensure both story levels are completable by a human and by baseline_careful: run the baselines headless over hangar and quarantine and the five situation levels; if a baseline gets stuck due to a level/geometry bug, fix the level or navigation. Fix the pickup consumption, sealing, closet, fireball targeting issues listed above, with tests.
5. Keep the five operations + eval harness green (tests/agent*.test.ts). Update docs/rule-source-map.md so EVERY implemented rule has a row with label code/manual/observed/assumed/design and a locator: use docs/research/doom-rules.md for Doom-derived rows (cite file+function from linuxdoom-1.10), and point design rows at docs/DESIGN.md sections. Also docs/CONTRACTS.md update.
6. README.md: title, one-paragraph pitch (pillar), how to play (controls), scope statement (included: 2 story levels + 5 evaluation situations, 3 enemy types + crew, rules; excluded vs Doom: vertical geometry/heights, multiple weapons beyond shotgun+stun, BFG etc., multiplayer, WAD support, original levels/assets — each with a reason), commands (npm ci, npm run dev, npm test, npm run typecheck, npm run build, npm run eval, npm run eval:live with env vars), credits & reuse terms (Doom GPL-2.0 source cited not copied; Freedoom not used; Hideous Destructor/Total Chaos inspiration only; Higgsfield art per public/art/CREDITS.md; procedural audio original), and links to docs.
7. GitHub Pages: add .github/workflows/pages.yml (on push to main: npm ci, npm test, npm run build, upload dist with actions/upload-pages-artifact@v3 and deploy with actions/deploy-pages@v4; permissions pages:write, id-token:write) and .github/workflows/ci.yml (npm ci, test, typecheck on push/PR). vite base './'.
8. Performance budget: the target browser has NO GPU acceleration. Keep total frame work < 6 ms at 480x270 in Node benchmark; avoid per-frame allocations in main loop; overlay HUD redraw only when changed (except crosshair).
Run npm test, npm run typecheck, npm run build — all must pass. You cannot commit (sandbox); leave changes uncommitted and finish with a summary of what changed, what you verified and what remains.

9. After merging, tests/agent.test.ts "rule invariants" fails: health went to -2 (expected >=0). Decide the correct invariant (clamp player health at 0 on death in world.ts, or assert >=0 only while alive) and fix the real cause; keep the test meaningful. Record this as the genuine observed regression test in tests (name it "regression: player health can go negative after merge of mechanics damage") and in docs/DECISIONS.md.
