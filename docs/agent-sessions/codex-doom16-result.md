Fixed the freeze. [engine-page.js:71](../../public/engine-page.js) queried `_tremor_pressure()` before `callMain`; its C traversal looped on the uninitialized thinker list.

Settings now use pressure cached during gameplay frames. Layered default, audible horror score and fear-driven darkening remain intact.

Regression evidence: all three styles timed out before the fix; all pass afterward using real WASM startup in happy-dom.

Validation passed: 57 tests, typecheck, build, and 508 engine checks. Evidence recorded in [review-response.md](../reviews/review-response.md).

No commit made. Chrome audio listening was not rechecked.