# Tremor Node engine artifacts

GPL-2.0-or-later, including original Tremor adapters and inherited doomgeneric/id
Software source. Full terms: LICENSE.txt. Corresponding source: ../engine/source.zip
in a static distribution, or engine/ in the project repository. Nuked OPL3's
LGPL-2.1-or-later source/license is included there; no Chocolate Doom music code.

Rebuild from the project root with `npm run engine:headless` and
`npm run engine:headless:test`. Requires emsdk only to rebuild. CI runs these
artifacts directly on Node 24. doom.cjs + doom.wasm is the production synchronous
module; doom-test.cjs + doom-test.wasm adds private test fixtures. Artifact/WAD
SHA256 values are in artifacts.json. See docs/CONTRACTS.md for the 17-action ABI.
