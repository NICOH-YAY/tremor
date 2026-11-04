Fixed both bugs:

- Replay loading verifies compressed or decompressed bytes against the matching manifest hash. Scripts and tests cover both paths.
- Controls wrap, and the overlay stacks below 1100px. Headless Edge confirmed no horizontal overflow at an 800px window.

All 65 tests, typecheck, build, and 508 engine checks passed. No commit made.