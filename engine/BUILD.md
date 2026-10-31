# Engine build

Node24+ suffices with committed artifacts. Source rebuild: Python and emsdk6.0.13.
Activate emcc on PATH or set EMSDK to SDK root; EMSDK_PYTHON defaults to running
Python. No machine-specific defaults. Run from project root (also works after
copy to game-dev-f26/midterms/nicoh-yay/):

```sh
npm ci
npm run engine:headless
npm run engine:headless:test
npm run engine:build
python engine/build/artifacts.py
npm run engine:test
npm test
npm run typecheck
npm run build
```

engine:test invokes tests.c compiled in committed doom-test.cjs/wasm: no emsdk.
Production omits fixtures. Rebuild all three after C changes. Browser build also
ships GPL source.zip/licenses. artifacts.py normalizes LF and hashes shipped bytes
and C source snapshot (not a proof of byte-for-byte compiler reproducibility).

Browser -O2, no Asyncify. Paused rAF returns and excludes elapsed pause time;
intro gates by Promise. Direct frames replace blocking melt wipes. Headless is
synchronous with no main/audio loop. Shared320x200 renderer. Tremor 3 saves in IDBFS
/persist. Horror style disconnects OPL ScriptProcessor. engine:wad needs Pillow;
its recoloured Freedoom sprites remain BSD. No proprietary WAD ships.

Production smoke: node engine/build/browser-smoke.mjs, preview-smoke.mjs, smoke.mjs.
These do not measure audible output or target Brave Canvas/DOM cost.
