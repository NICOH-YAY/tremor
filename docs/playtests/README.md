# Playtests

## Assistant playtest, not human

The assistant browser playtests on 2026-10-31 reported these observations. TAB toggling caused blind walking; TAB now shows the map only while held. The take-control overlay obscured the crosshair; it moved to a corner and disappears after input. The automap showed an id level name; displayed names now use Freedoom replacements. Early unseen damage was confusing; directional red edge feedback was added and zero-fear damage scaling checked. The hint overlapped the status bar; codex-doom18 places hints within the displayed 3D view above row 168. These changes are not a human assessment of clarity or fun.

The layered-music startup freeze was included in the 2026-11-02 audit (the startup-fix session is dated 2026-10-31 in the session index): a pressure query ran before engine initialization. The query moved to initialized frame processing; the real-WASM start-flow regression covers startup. These are assistant observations and implementation records, not student or friend testimony.

## Human playtests (anonymous)

Four sessions involved friends and teammates, with names withheld and the student watching. The instructor's Nov 4 2026 update allows any human player to count.

### Playtest 1

Oct 30 2026

Build played was the retired TypeScript prototype before [4afe400](https://github.com/NICOH-YAY/tremor/commit/4afe400), authored Oct 30 at 11.02.20 EDT.

#### What the player did

They said that the game felt too short and easy, since all they did was go and kill people and there wasn't really an effect.

#### Where they hesitated or guessed

They were confused on what to do when there wasn't any direction so I told them basically the end goal to escape after finding the keys to the rooms. This was the only session where I helped.

#### What I changed or would change

After that I asked to follow the actual Doom game and add my earlier ideas like the fear.

### Playtest 2

Oct 30 2026

Build played was the first real-Doom build after [4afe400](https://github.com/NICOH-YAY/tremor/commit/4afe400) and before the horror pass [27f662b](https://github.com/NICOH-YAY/tremor/commit/27f662b), authored at 19.26.12 EDT that day. This build window had no radio voice or terror.

#### What the player did

No notes recorded.

#### Where they hesitated or guessed

They were confused as to what to do. They sort of just wandered around the area and got hit, and said the game felt more mysterious if anything but it was still confusing. I watched without helping.

#### What I changed or would change

In response I added the moral aspect, a limited bullet count and Tremor, then added the speech at the beginning so there is a clear end goal for the player.

### Playtests 3 and 4

Nov 1 and Nov 2 2026

Build played was the build live on each date, after radio voice and terror. The nearest main-history commit before Nov 1 by author time is [c042ec0](https://github.com/NICOH-YAY/tremor/commit/c042ec0), Oct 31 at 17.41.44 EDT. It is also the nearest commit before Nov 2 began. Nov 2 has several later commits through [338dc14](https://github.com/NICOH-YAY/tremor/commit/338dc14), authored at 14.14.08 EST. Session times and exact deployed revisions were not recorded.

#### What the player did

I watched without helping. Feedback was the game feels scary, which I thought was appropriate since it was a sub-thing I was trying to go for anyways. But they said it's too hard.

#### Where they hesitated or guessed

I noticed that they both stopped moving at the start when the voice came on and had a reaction. Then later when the voice talked again they were kind of "spooked" but with the music that sort of sounds like heartbeats they were like running and just killing things. But after clearing a room when the graphics were sort of bad they were both looking around and pressing buttons on the wall to see if it opened. When they saw the vision get a bit more blurry they sort of attributed the "fear" effect to being drunk in GTA and guessed that was the mechanic. The ammo count they didn't realize was limited until they ran out of bullets and had to fight with their fists.

#### What I changed or would change

The last playtester was on a Mac trackpad, which was slow and clunky, and they ended up dying a lot. I left the difficulty as it is and wrote what I would change in the limitations section of EVALUATION.md.

Evidence: [Limitations](../../EVALUATION.md#limitations-in-nicohs-words)

