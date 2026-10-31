# Third-party provenance

| Component | Version/commit | License | URL | Shipped? |
|---|---|---|---|---|
| doomgeneric/id Doom/Chocolate-derived port | e257a09527062bfb986b6e5e0780839b6cbd5b71 | GPL-2.0-or-later, headers retained | https://github.com/ozkl/doomgeneric | Source,WASM,source.zip |
| Freedoom Phase 1 |v0.13.0 | BSD-3-Clause | https://github.com/freedoom/freedoom/releases/tag/v0.13.0 | IWAD,modified recoloured PWAD sprites;CREDITS link in wad license |
| Nuked OPL3 |1.8 cfedb09efc03f1d7b5fc1f04dd449d77d8c49d50 | LGPL-2.1-or-later | https://github.com/nukeykt/Nuked-OPL3 | Source,linked WASM,relink inputs in source.zip |
| Emscripten SDK/runtime glue |6.0.13 | MIT/UIUC, individual notices | https://github.com/emscripten-core/emscripten/blob/6.0.13/LICENSE | JS glue shipped,SDK build-only |
| Vite/Vitest/TypeScript/happy-dom/tsx |package-lock.json exact versions | MIT | package-lock.json package repositories | Dev/test/build only |
| @google/genai |package-lock.json | Apache-2.0 | https://github.com/googleapis/js-genai | Node eval only |
| @types/node |package-lock.json | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped | Types only |
| Higgsfield generated art |z_image,2026-10-30 | Output terms;project creative files GPL to extent applicable | https://higgsfield.ai/terms-of-use-agreement | See public/art/CREDITS.md |

GPL applies to combined engine/application code; assets/dependencies retain their
separate notices. BSD conditions/copyright retained. GPL corresponding source and
LGPL relink inputs ship with binary. Proprietary Doom WADs excluded. Phobos/UAC
used descriptively, no affiliation with id Software/ZeniMax. Original Halloran
text/procedural audio code are Tremor creative content.
