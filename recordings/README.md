# Automated Tremor recording

Produced with installed Microsoft Edge (headless=new), puppeteer-core, a 1920x1080 canvas at requested 30 fps, VP9/Opus MediaRecorder at 7.5 Mbps video / 192 kbps audio. No human game input or new model calls.

Run from the project root (D:\Coding VS\tremor locally; midterms/nicoh-yay in the course checkout):

```sh
# cwd: project root
npm run demo:copy
npm run record:video
```

The command builds dist and serves gzip as raw bytes. EDGE_PATH overrides the installed Edge path; RECORD_HEADED=1 selects an offscreen headed window.

Content: 15 s title/rules; 20 s agent interface; 120 s LIVE model-history demo replay at 1x; 2 s labelled skipping-ahead cut executing all remaining actions; 10 s verified timeout ending (five-minute episode cap, no exit); 45 s clean-run baseline_careful success segment at 2x (holds verified exit afterward); 25 s results computed from the committed 2026-10-31 JSON (revision 8f0e4a9); 10 s limitations. Both replays require the watch page's verified badge. For limit endings the recorded reason is applied; state metrics are independently reproduced. Demo has 293 calls and 289 actions; it is excluded from suite results.

Output: tremor-agent-2026-11-02.webm (gitignored). Duration: 248.188 s; EBML Info Duration read back from the final file: 248.188 s. Duration is patched in pure JS after capture. Cues are not added; seeking depends on player cluster scanning. Size: 92298487 bytes. SHA-256: `ae21a95bc7f808d1e65b506976d130d12a269781a5b6ddf66145320a8aa1c777`.

Audio: Opus track present; independent offline decode RMS 0.046630, peak 0.887559; all sources share the captured master: Freedoom OPL music in Layered mode, the existing horror score, engine DMX SFX and decoded Halloran radio. Measured master peak 0.7459426522254944; OPL peak 0.10954829305410385; SFX starts 99; radio clips 2.

Speaker output was disabled by routing the master only through the analyser to MediaStreamAudioDestinationNode, with Edge --mute-audio as a second safeguard. Nonzero captured levels with that flag verify that it preserves stream capture.

Per-section captured bus levels:

- title: peak 0.000000, RMS 0.000000
- Tremor: peak 0.000000, RMS 0.000000
- The agent interface: peak 0.000000, RMS 0.000000
- model demo 1x: peak 0.667767, RMS 0.045664
- skipping ahead and timeout: peak 0.326950, RMS 0.042205
- baseline careful 2x: peak 0.745943, RMS 0.065784
- Declared suite: peak 0.181017, RMS 0.040610
- Limits of this evidence: peak 0.162876, RMS 0.043168

Frame delivery: 58645 animation frames, 6 gaps over 50 ms; largest gap 475.0 ms. Requested capture is 30 fps; these timing measurements report renderer stalls, not a guarantee of every encoded frame. Recording runs in real time.

Upload the webm to a CourseWorks-viewable location and add its link to the submission. Human playtests remain separate.
