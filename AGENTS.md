# Tremor ownership

All implementation is original. Do not copy id Software/linuxdoom code or assets.

- Renderer worker owns `src/render/`.
- Mechanics worker owns `src/sim/enemies/` and `src/sim/rules/`.
- Content worker owns `src/levels/` and `src/audio/`.
- Integrator (Codex) owns everything else, especially `src/sim/types.ts`, world, geometry, interface, main, configuration and tests.

Workers only add/replace files in their area, plus one registration line per new module in `src/sim/registry.ts` or `src/levels/index.ts`. Existing stub registrations need no changes. Do not edit shared contracts on worker branches; report needed additions to the integrator. Keep imports through shared types; avoid dependencies on another worker's implementation. Registrations must be additive to ease merges. See `docs/CONTRACTS.md` for lifecycle and units. Run typecheck, tests and build before handoff. Work on separate branches; integrator merges them later.
