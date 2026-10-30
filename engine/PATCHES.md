# Platform overrides

No upstream tracked file was changed.

`platform/i_sound.c` is copied from upstream `doomgeneric/i_sound.c` with only the conditional SDL_mixer.h include removed. The web sound modules use Web Audio rather than SDL. This override is compiled instead of the original; it retains upstream copyright and GPL notices.

`platform/doomgeneric_web.c` supplies the browser lifecycle, direct input events, framebuffer callback, and Asyncify sleep. `platform/sound_web.c` supplies DMX effect playback and a silent music module. Neither changes gameplay rules. The engine remains doomgeneric's Doom port, with its upstream fixes and feature exclusions, not a claim of byte-identical DOS Doom behavior.
