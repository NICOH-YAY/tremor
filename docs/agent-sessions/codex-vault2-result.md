Rebuilt on `nicoh-yay/vaulting-ambition`. Play at **http://127.0.0.1:5173/**.

Implemented first-person mouse-look, reach dot, sticky bending pole, launch feedback, midair replanting, deterministic collisions, five stages, one halfway checkpoint, and HUD/pause settings. Assets, CI, and title art are preserved. No commits, pushes, or model calls.

Changed files include:

- `src/sim/{index.ts,level.ts,tower.json,search.ts}`
- `web/src/{main.ts,scene.ts,style.css}` and `web/index.html`
- `tests/sim.test.ts`, `vitest.config.ts`
- README, CREDITS, design/evidence docs, and saved search routes.

**Controls:** Click Start; mouse looks. Hold left mouse to plant/bend, release to launch. WASD nudges, R respawns, Esc pauses. Look down for the first floor vault.

**Verification:** 15 tests pass; typecheck and production build pass. Legal-action search and exact replay reach the checkpoint in **5 vaults** and summit in **11**.

**Tuning:** [sim/index.ts](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/src/sim/index.ts:4>) holds 4.5m reach, 0.8s bend, 5–14m/s launch speed, gravity 20, and 120Hz stepping. Edit `tower.json` for course geometry.

**Known limits:** Browser tooling was unavailable, so pointer lock, visuals, and aiming feel still need desktop playtesting. The discrete controller abstracts charging time. Root Python/setup checks remain blocked by missing dependencies, Windows privileges, and authentication; Vite reports a bundle-size warning.

[Claude review handoff](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/docs/REVIEW-HANDOFF.md>) is ready; independent review remains pending.