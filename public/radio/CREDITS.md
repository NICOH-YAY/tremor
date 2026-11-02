# Radio audio provenance

The WAV clips are synthesized readings of the original Tremor text in lines.json, generated locally on 2026-11-02 with eSpeak-NG via @echogarden/espeak-ng-emscripten 0.3.5 (default English voice, rate 145, pitch 30). They replace the browser speech fallback for capture through Web Audio; no human performance is claimed. Audio/content are distributed under the project GPL-2.0-or-later terms. The synthesizer is a generation tool and is not shipped or linked with the game; its GPL-3.0 code is available at https://github.com/echogarden-project/espeak-ng-emscripten and https://github.com/echogarden-project/espeak-ng .

Regenerate from the project root after installing the tool in a separate directory and setting ESPEAK_MODULE to its espeak-ng.js:

```sh
# cwd: project root
node scripts/generate-radio-local.mjs
```

The game tries a separately supplied MP3 first, then these WAV files; recording reads WAV directly. No proprietary IWAD audio is used.
