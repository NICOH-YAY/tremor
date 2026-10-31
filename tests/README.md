# Active CI coverage

Only tests/**/*.test.ts/js run. legacy/ excluded from Vitest/TypeScript/build.

| Test file | Five rubric kinds covered |
|---|---|
| agent.test.ts | Invariants: shipped tests.c fear thresholds/decay/once, ammo, healing, trauma, mercy, saves/radio; legal/illegal; successful terminal exit; observed purge/gore regressions; episode step/call/time/fallback limits |
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
