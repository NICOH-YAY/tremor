# Active CI coverage

Only tests/**/*.test.ts/js run. legacy/ excluded from Vitest/TypeScript/build.

| Test file | Five rubric kinds covered |
|---|---|
| agent.test.ts | Invariants: shipped tests.c fear thresholds/decay/once, ammo, healing, trauma, mercy, saves/radio; legal/illegal; successful terminal exit; observed purge/gore regressions; episode step/call/time/fallback limits |
| solver.test.ts | Public-only observation access/import boundary, supplied legal actions, mapped BFS detour, READ/hostile/retreat behavior, deterministic fixed-seed real-engine traces and explicit terminal within 600 steps/calls |
| baseline.test.ts | Legal public decisions; normal-spawn E1M1 seeds 17/83 successful terminal regression |
| browser-engine.test.js | Observed double-init/intro and pause-preview regressions against production WASM |
| browser-assets.test.js | Public JS syntax, title/help initialization and repeated malformed-WAD-before-audio regression |
| startup.test.js | Concurrent intro waiters and pointer-lock failure regressions |
| settings.test.js | Profile/binding/conflict/persistence invariants |
| headless-artifacts.test.js | Public/fixture boundary, hashes and deployed assets invariants |
| engine.test.ts / engine-abi.test.js | Production binaries, IWAD and ABI invariants |

Five kinds: invariants, legal/illegal actions, successful terminal, observed
regression, episode limits. Fake/replay controllers labelled mocked. Real normal
spawn and C rule checks use WASM. No compiler/paid API in CI. engine:test prints
C check count as well. Hashes bind exact artifacts/source snapshot, not a compiler
reproducibility proof. CI workflow is .github/workflows/midterm-nicoh-yay.yml.
## Observed-regression evidence

The regressions failed before their fixes and pass afterward, as recorded in [docs/SKILL-INVOCATIONS.md](../docs/SKILL-INVOCATIONS.md). In codex-doom12, the level-check stun/purge regression FAILED at tic 42 before the identity fix: crew had 25 rounds, two charges and unknown identity, while possessed had 28 rounds, one charge and revealed crew identity. The full-channel regression passed after the fix in commit `9927bfee94a74b39a0e20fe029905ca4f139a47f`.

In codex-doom13, `tests/model-player.test.ts` failed before `src/agent/prompt` existed. After its implementation in commit `8f0e4a9dc937904ec47b1fe00045315330a112ae`, the recorded suite passed 50/50 tests (current suite: 80 tests in 20 files). Both fix commits were verified against local git history and their patches.

# Spectator checks

`watch-replay.test.ts` executes all three unchanged committed recordings in both
headless and browser-spectator WASM and compares status/reason/score and every
metric with the original report. `watch-page.test.js` runs the page runner with
the real spectator WASM in a DOM harness, checking replay selection, pause,
verification and switching to the live careful baseline. These are deterministic
replay/application checks, not new live model trials or visual browser QA.
