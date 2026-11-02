Implemented on `feat/doom`, left uncommitted, and rebuilt `public/engine` plus the source archive.

- Settings overlay with rebinding, conflicts, persistence, pause, and all requested options.
- OPL music supporting both MUS and MIDI, with verified title/level audio and song transitions.
- IDBFS save persistence wired into Doom’s save flow.
- Reusable blit buffers, independent presentation scheduling, and optional FPS display.

Passed: 112 tests, typecheck, build, 177 real-engine checks, framebuffer smoke, and MUS/MIDI audio smoke.

Remaining limitations: no browser was available to verify Brave performance, audible playback, pointer lock, or saves after reload. Music uses main-thread ScriptProcessor; MIDI sustain, expression, and pan are currently ignored.