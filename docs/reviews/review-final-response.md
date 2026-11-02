# Response to final independent review ? 2026-11-02

The protected [review](review-final-2026-11-02.md) is unchanged. No commits or new live model calls were made.

| Finding | Resolution |
|---|---|
| F1 | demo:copy copies the unchanged gzip into eval/traces-sample/demo and writes its result report; manifest records both paths. Executed demo:copy locally. The same SHA-256, report and headless/browser determinism test covers it. The live source trace is preserved. |
| F2 | Live watch controller explicitly terminates at 600 actions, preserving earlier natural terminal outcomes. Stationary-controller regression reaches exactly 600 and step_limit. Clock explicitly says active wall time, independent of presentation speed. |
| F3 | README, EVALUATION and recording guide distinguish applied recorded limit reasons from independently reproduced metrics. |
| F4 | Removed stale current count in favor of this validation record; explained player_interface/runner source hash differences; corrected review order and linked both responses plus final response. Fixed codex-doom12 heading. |
| F5 | Neutral submission revision/reflection placeholders, sentence capitalization fixed, duplicate project paragraph removed. Recording upload remains a factual pending item. |
| F6 | Inline executable commands in README explicitly say cwd: project root; fenced commands retain the course checkout directory. Setup identifies local and course paths. |
| F7 | EVALUATION discloses baseline sample revision 203810d / dirty stamp and matching outcomes/metrics from the clean run. New careful success sample is copied from the clean 8f0e4a9 run. |
| F8 | Empty reason renders (no reason given); absent historic reason remains labelled unavailable. Added UI assertion and a model-player regression proving its own reason never appears in the next request. |
| F9 | Earlier fork CI link is historical only. Final course PR run URL/SHA explicitly pending until the PR opens; no final CI claim is made. |

Recording: see [production details](../../recordings/README.md). The automated recording uses real-time installed Edge, deterministic spectator replays and master Web Audio capture. The demo contains 293 calls, 289 actions, four errors and ends at the five-minute episode cap. It is excluded from the declared-suite results.

Validation: npm test passed 70 tests in 17 files after demo:copy and spectator rebuilds. Typecheck passed; engine:test passed 508 checks, zero failures. Browser, headless, fixture and spectator targets rebuilt; LF artifact hashes refreshed. Existing upstream compiler warnings and the art/title.jpg Vite resolution warning remain. Final recording and post-edit checks are recorded below when complete.

Silent recording: the master connects only to an analyser and MediaStreamAudioDestinationNode; a fake AudioContext regression asserts that no connection reaches the speaker destination. Edge also launches with --mute-audio. Per-section peak/RMS and Opus track presence are checked and reported in recordings/README.md.

Evaluated-engine preservation: no headless WASM rebuild was needed in this continuation. The evaluated doom.cjs and doom.wasm remain byte-identical to HEAD and the evaluated hashes (48da0896 and d60641d7). The retained agent_api.c audio initialization is under TR_WATCH; doomgeneric_headless.c audio updates are inside its existing TR_WATCH block, and build exports change only for --watch. These are spectator-only changes required to capture OPL/SFX. artifacts.json changes describe spectator/source files; evaluated headless binary hashes remain unchanged. The replay suite independently matches headless and spectator terminal metrics. The prior session rebuilt browser/headless/fixture targets as recorded above; its evaluated binaries have no working-tree diff. No rules changed.

Recorder follow-up validation: a 1 MiB stack is configured only for TR_WATCH builds. The automap observation has a 257?257-byte local grid, exceeding the prior default stack; with music allocations this corrupted memory and failed at the exit music transition. A fake-audio regression now requests observations, renders OPL blocks, and reaches the identical careful-baseline exit record. The evaluated headless build flags and binary hashes remain unchanged. Each watch selection also starts a fresh spectator instance. The final video independently decodes its Opus audio offline, without playback.

Final recording completed in Edge headless=new with --mute-audio: 248.187 s, 82,780,135 bytes, SHA-256 1692d672b64200de990cfcbf478e00cc830345f7db9187d22638578d345e3aae. Both replay badges verified. Opus track independently decoded offline (stereo, 48 kHz, RMS 0.046633, peak 0.799940); per-section levels are in recordings/README.md. Four renderer gaps over 50 ms, maximum 75 ms. No headed fallback, model calls, human game input, commits or speaker connections.
