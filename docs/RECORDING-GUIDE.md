# Recording Tremor automatically

From the project root (D:\Coding VS\tremor locally; midterms/nicoh-yay in the course checkout):

```sh
# cwd: project root
npm ci
npm run demo:copy
npm run record:video
```

The recorder builds dist, serves it locally with raw gzip bytes, and drives the installed Microsoft Edge using puppeteer-core. No browser download, manual game input, or new model calls are needed. EDGE_PATH overrides the Edge executable; RECORD_HEADED=1 uses a headed offscreen window if needed. The watch page record mode is watch.html?record=1&script=default.

The 4-minute script contains title/rules, interface, the 2026-11-02 live demo at 1x with its own recorded reasons, a labelled cut to its verified timeout ending, the clean-run careful success at 2x, results computed from the committed JSON and limitations. All visuals are composited into one 1920?1080 canvas. Its 30 fps capture stream and the master Web Audio destination are recorded as VP9/Opus. OPL music, horror score, engine SFX and decoded radio share that destination. Replays use the same deterministic watch path and must reach the verified badge.

For step/call/timeout endings, the recorded limit reason is applied to the replay; final tic, health and all other metrics are independently reproduced from the actions. The episode clock sums recorded latency and excludes runner overhead. It is separate from simulation time. Empty reasons show ?(no reason given)?; older absent reasons remain labelled unavailable.

See [produced file details](../recordings/README.md) for duration, size, hash, audio-track verification and renderer timing. WebM files are gitignored. The [uploaded recording](https://drive.google.com/file/d/1-gUtdHicrsxu483OgbBwNUdB4stBCUJH/view?usp=sharing) is linked from README and viewable by anyone signed in with a columbia.edu account. Include the URL in the course PR. Human playtesting, peer notes and personal reflections remain separate evidence.

Silent capture is mandatory: record mode never connects to AudioContext.destination. Edge runs with --mute-audio as an additional safeguard. An analyser on the captured bus measures peak/RMS per section; an entirely silent recording fails. Normal game/watch audio is not used for recorder testing.

Recording polish: both traces are deterministically verified before capture starts, and the verified badge persists during playback. The record canvas applies brightness 135% and contrast 108% only to the game picture; panel text is at least 28 px and captions are 34 px. The results table uses two-decimal model costs and $0 for zero-cost baselines. After capture, scripts/webm-duration.mjs inserts Segment Info Duration and the recorder reads it back from disk before hashing. Cues are absent; seeking depends on player cluster scanning. Presentation changes do not affect the evaluated simulation.

