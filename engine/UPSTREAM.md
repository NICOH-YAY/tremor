# Engine upstream

URL: https://github.com/ozkl/doomgeneric
Commit: e257a09527062bfb986b6e5e0780839b6cbd5b71
License: GNU GPL version 2 or later; see doomgeneric/LICENSE and individual headers.

The existing pristine-import commit preserves upstream tracked files unchanged. The working tree now adds original marked Tremor patches, inventoried in PATCHES.md. No commits were created or rewritten by Codex.

Emscripten SDK: 6.0.13, releases-eb132757325583b787fe9414b09afea9442b72ad-64bit, installed externally (set EMSDK or use emcc on PATH).
Freedoom Phase 1: v0.13.0, BSD-3-Clause; release URL, WAD hash and full terms in public/wad/FREEDOOM-LICENSE.txt.

New platform code is GPL-2.0-or-later. Distribution of the compiled engine must retain the GPL license and offer its corresponding source (this repository, including platform code and build scripts). Freedoom's separate BSD terms remain applicable to its data. Proprietary Doom WADs are neither included nor downloaded.

## Added FM dependency

`engine/vendor/nuked-opl3/{opl3.c,opl3.h,LICENSE}`: Nuked OPL3 by Nuke.YKT, upstream https://github.com/nukeykt/Nuked-OPL3, pinned commit `cfedb09efc03f1d7b5fc1f04dd449d77d8c49d50` (1.8). Unmodified files downloaded from that revision. GNU LGPL 2.1 or later; complete license and original copyright headers are retained. Corresponding dependency and application source, including the build instructions needed to relink a modified emulator, ship in `public/engine/source.zip`. The complete engine continues to be distributed under GPL-2.0-or-later.

`engine/platform/music_web.c` is an original MUS/SMF sequencer and GENMIDI-to-OPL register bridge, GPL-2.0-or-later. No Chocolate Doom sequencer/music implementation was copied. Chocolate Doom's public GENMIDI struct declarations were consulted to verify the binary instrument layout: https://github.com/chocolate-doom/chocolate-doom/blob/master/src/i_oplmusic.c . No IWAD instruments, music or sounds are extracted into the shipped source or compiled WASM; they are read from the user-selected IWAD at runtime.
