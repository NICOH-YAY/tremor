Fixed and left uncommitted.

Changed:
- `.gitattributes`: added all requested byte-preserving and LF rules.
- `engine/build/headless.py`: manifest output now always uses LF.
- `public/engine-headless/artifacts.json`: regenerated hashes from LF bytes.
- `tests/headless-artifacts.test.js`: added a CRLF regression check; retained exact-byte hashing.
- Normalized generated text under `public/engine/`, `public/engine-headless/`, and `public/wad/`; verified those bytes match the committed LF blobs.

Validation: all 116 tests passed, typecheck passed, build passed. Build reports an unresolved `./art/title.jpg` reference.