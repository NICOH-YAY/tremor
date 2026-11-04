Implemented a substantial horror pass and left everything **uncommitted**. **The full request is not complete.**

Implemented corpse-sight terror, fear-based misses/damage, scarce ammunition and mercy rewards, objectives and paused previews, radio events/subtitles, procedural horror audio, monster sprite transforms, freelook, partial interpolation, settings and direct E1M1 startup.

Changed engine rules/rendering/save/demo hooks, browser presentation/settings/startup, agent observations, sprite generation, tests, documentation and generated artifacts. The complete file list, constants and limitations are in [HORROR-STATUS.md](../HORROR-STATUS.md).

Validation:

- **454 engine assertions passed**
- **117 Node tests passed**
- Typecheck, build and whitespace checks passed
- Browser and both headless builds rebuilt; artifact hashes regenerated

Measured stationary E1M1 in Node:

| Metric | Before | After |
|---|---:|---:|
| Mean frame interval | 23.30 ms | 23.04 ms |
| p95 frame interval | 32.15 ms | 31.98 ms |
| Renderer CPU mean / p95 | Uninstrumented | 0.341 / 0.948 ms |

These exclude Canvas/audio. **640×400 and target Brave timings are unavailable.**

Core constants: 1024-unit corpse range, eight candidates/tic, −1 terror/10 seconds without exposure, 50% carryover, hit chance down to 30.08%, damage up to 1.6×, 25% map ammo retained, 12.1% death drops, +3 mercy rounds, 90-second radio cooldown.

**Unfinished/approximated:** native 640×400 and resolution selection; sharp-bilinear presentation; immediate per-frame mouse turning and full view interpolation; dependency-aware objective routing and safe-vantage search; complete episode radio history; reversed monster layers. Audio uses procedural approximations and speech fallback without recorded MP3s. Brave pointer lock, painting cost, audible balance and full-episode play remain unverified because no browser was available.

Radio lines in [lines.json](../../public/radio/lines.json):

| ID | Text |
|---|---|
| `e1m1` | This is Halloran, UAC comms. I locked myself in control when the hangar crew stopped answering. Find the way out; I will stay on this frequency. |
| `e1m2` | You are inside the containment perimeter. They sealed those doors with people still working behind them. Look for a card beside the locked routes. |
| `e1m3` | The treatment plant is running without its operators. Something is moving against the current. Follow the access doors toward the exit. |
| `e1m4` | That station used to report every fault to me. Now every light is green and nobody answers. Find the next passage out. |
| `e1m5` | This is the laboratory sector. We kept the samples cold; that did not keep them quiet. The secured route should take you onward. |
| `e1m6` | The central complex is ahead. I can hear its alarm through the wall of this room. Find the access card and keep moving. |
| `e1m7` | You have reached the computing wing. The terminals are still accepting names from empty desks. Look for the route beyond the locks. |
| `e1m8` | The last facility is beyond this threshold. I cannot promise what waits there. Get to the exit while this channel holds. |
| `e1m9` | This annex was missing from the evacuation plan. There are voices on its local channel, all using the same name. Find a route back out. |
| `crew-reveal` | That one's still human. Look before you shoot. |
| `crew-death` | I heard that. I'll keep the channel open. |
| `crew-saved` | They're breathing. Thank you for waiting. |
| `breaking` | Listen to my voice. There is still a way out. |
| `static-1` | Control to anyone. Is that someone breathing on the line? |
| `static-2` | There is someone outside this room. They know my name. |
| `static-3` | Signal dropping. I can still hear you. |
| `static-4` | Please do not answer the other channel. |
| `static-5` | The banging stopped. That is worse. |
| `static-6` | I thought I heard the lift. It was above me. |
| `static-7` | Keep the receiver close. The walls carry sound here. |