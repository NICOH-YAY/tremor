You are Codex, editor for Tremor in the Tremor repository root (main). CI on Linux fails: tests/headless-artifacts.test.js says public/engine-headless/doom.cjs hash mismatches the manifest. Cause: git core.autocrlf=true on this Windows checkout converted generated artefacts to CRLF locally, and the manifest hashes were computed from the CRLF copy, while the repo/Linux has LF.
Fix permanently:
1. Add a .gitattributes making generated/build artefacts byte-exact: public/engine/** -text, public/engine-headless/** -text, public/wad/** binary, *.wasm binary, *.wad binary, and `* text=auto eol=lf` for source files so tests hashing files are stable on every OS.
2. Convert the working-tree copies of the affected generated files back to LF (exactly the bytes emitted by the emcc build — rebuild the headless target if simpler) and regenerate whatever manifest the test reads so hashes match the LF bytes.
3. Make the hash test robust: if any other test hashes text files, normalize or rely on the -text attribute.
Run npm test, typecheck, build — green. You cannot commit; leave uncommitted. Summarize which files changed.
