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

The [uploaded recording](https://drive.google.com/file/d/1-gUtdHicrsxu483OgbBwNUdB4stBCUJH/view?usp=sharing) is viewable by anyone signed in with a columbia.edu account. The uploaded file size was verified as 92298487 bytes, matching by size the local file with the SHA-256 listed above. The hash was not recomputed remotely. Human playtests remain separate.

## Gemini-only recording / 2026-11-04

Run `npm run record:gemini`. Separate recorder and config: `scripts/record-gemini.mjs`, `scripts/record-gemini-config.mjs`; the original `record:video` is unchanged. Sources must match Git HEAD byte-for-byte. The config stages the committed results into dist only; no model calls or action edits.

Content: 10 s title describing Gemini, its public observations and limits; 260 s of the model-history demo (E1M1, seed 17) at 1x with verbatim reasons; labelled 2 s skip cut executing every remaining action and 5 s verified timeout ending; 10 s honest results card. The segment is labelled a deterministic replay with map, seed, condition and terminal reason throughout. The committed declared suite reports 0/14 exits for history and 0/14 for observation-only. History: 6 deaths and 8 timeouts; observation-only: 7 deaths and 7 timeouts. The shown demo ends at the five-minute cap. Demo is excluded. E1M6/E1M7 local traces are uncommitted and excluded under the committed-source requirement. Source: eval/results/2026-10-31-2026-10-31T06-19-01-385Z-results.json.

Output: tremor-gemini-2026-11-04.webm (gitignored). Duration: 287.283 s; patched EBML Info Duration read back: 287.283 s. Size: 157526956 bytes. SHA-256: `f61a1ca35ea0871c88e1614a3a8b2f872994e4c5aeab552c942abd8d9bc85d62`. No Cues added.

Watch-page badge: E1M1 seed 17: Replay verified. Terminal reason and all metrics reproduced.

Audio: Opus present; offline decoded RMS 0.042106, peak 0.636288. Layered Freedoom OPL music, horror score, engine SFX and radio share the captured master; OPL peak 0.11224624514579773, SFX starts 18, radio clips 1. Audio routes only through the analyser to MediaStreamAudioDestinationNode, with Edge --mute-audio; no speaker connection. Title silence is intentional.

Per-section captured bus levels:

- title: peak 0.000000, RMS 0.000000
- The Gemini player / recorded live decisions: peak 0.000000, RMS 0.000000
- Demo (outside suite) / E1M1 / seed 17 / history / terminal: timeout / 1x: peak 0.615513, RMS 0.043381
- Demo (outside suite) / E1M1 / seed 17 / history / terminal: timeout / labelled skip cut: peak 0.137749, RMS 0.038565
- Honest results / committed declared suite: peak 0.196206, RMS 0.038161

Frame delivery: 67927 animation frames; 2 gaps over 50 ms; largest gap 1000.1 ms. Requested 30 fps at 1920x1080, VP9/Opus, 7.5 Mbps video / 192 kbps audio; renderer timing is not a guarantee of every encoded frame. Captured in real time using installed Edge (headless=new).

Independent final-file inspection with `node scripts/inspect-recording.mjs recordings/tremor-gemini-2026-11-04.webm` confirmed 1920x1080, 287.2827 s video duration, and readable title, gameplay/reason caption, verified terminal badge and results frames. Paused inspection and offline decoding remained muted. Encoded section RMS / peak: title effectively zero; gameplay (10-270 s) 0.043169 / 0.636288; skip and terminal (270-277 s) 0.038178 / 0.143660; results (277 s to end) 0.037655 / 0.202878.
