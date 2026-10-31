# Tremor ownership

Codex is sole code editor; Claude plans, reviews and commits. Codex must not commit.
Active engine is GPL doomgeneric plus original Tremor patches, with BSD Freedoom
data. Retain upstream notices, licenses, screenshots and provenance. No proprietary
IWAD assets. See engine/UPSTREAM.md and THIRD-PARTY.md.

Rules: engine/tremor/. Platform: engine/platform/. Mark inherited engine patches.
Course API: src/player_interface.ts. Controllers: src/agent/. Runner: src/eval/.
legacy/ is historical only and excluded. No worker ownership applies now.
C/TS action ABI is append-only: update agent_api.c and ACTION_IDS together.
Controllers get detached public Observation, legal IDs and validation, never the
private WASM handle or evaluator outcome. This is not a code-import sandbox.

Invoke tremor-level-check before/after rule changes; log truthful results.
Run npm test, npm run typecheck, npm run build, npm run engine:test.
C changes require browser/headless/fixture rebuilds and LF artifact hashes.
Live evaluation requires --live; never fabricate outcomes, pricing or testimony.
Keep README, title/help, RULES, contracts and rule map synchronized.
