Changed within `midterms/nicoh-yay/`:

- `web/src/main.ts`
- `web/src/controls.ts`
- `web/index.html`
- `tests/controls.test.ts`

Start/resume now unpauses immediately. Pointer lock is optional; fallback uses right-button drag, Q/E or left/right arrows to turn, and R/F or up/down arrows to pitch. Left mouse retains plant/bend/release. HUD shows the active mode; Esc pauses both modes. Checkpoint reset remains in the pause menu.

Dev-only `window.__va` provides all requested methods. `step(0)` switches to manual timing for deterministic QA. Verified the hook is absent from production output.

All 17 tests, typecheck, and web build pass. Build reports a bundle-size warning. No commits, pushes, or model calls.