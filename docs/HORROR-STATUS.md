# Horror follow-up status (2026-10-30 local / 2026-10-31 UTC)

The prior pass is committed as 27f662b. This follow-up is uncommitted. Most horror
work is implemented and measured; native hires and successful bot traversal remain
unfinished. See EVALUATION.md for the failed completion target.

## Lighting and presentation evidence

Stationary Freedoom E1M1, default brightness 100, actual browser WASM rendered in
Node. The harness pauses and explicitly renders a complete frame at the start,
avoiding the startup wipe. All three captures are at tic 5,320x168 viewport only,
BGRA converted to weighted RGB luminance (0..255), before Canvas overlays:

| Lighting | Mean | Relative to vanilla |
| --- | ---: | ---: |
| Vanilla reference | 30.6702 |100% |
| Prior horror lighting | 21.5665 | 70.32% |
| Current | 14.4481 | **47.11%** |

Current is 66.99% of the prior pass. Sector light flickers in lit sectors;
wall/plane tables dim more steeply with distance and the sky is darker. The
96-unit suit floor light remains. Captures were visually inspected:
[vanilla](../engine/build/lighting-vanilla.png),
[prior](../engine/build/lighting-before.png),
[current](../engine/build/lighting-after.png). These use bundled licensed Freedoom.
The bright-reference variants are measurement builds, not agent artifacts.

Player XY/viewZ/angle/look direction and actor XYZ interpolate between simulation
tics. The old single-player synchronization path previously bypassed the intended
no-wait branch; that branch now presents even when no tic is available. Mouse
prediction applies per frame, then reconciles with recorded tic commands. Demo
canonicalization preserves its local bookkeeping without serializing it. Sharp
bilinear uses integer nearest offscreen pre-upscale followed by one smooth final
draw to the display backing store, including devicePixelRatio.

Production Node dummy sink, stationary E1M1 after tic 35: renderer mean
0.319ms / p95 0.418ms; presented-frame mean
interval 17.253ms / p95 30.913ms. There were
187 presentations between simulation tics among 466
sampled frames. Canvas/audio/browser layout are excluded. Sampling now excludes
startup; these are not a strictly matched comparison with older all-frame timings.

## Subtitles, fear, radio and diagnostics

Subtitles follow the actual canvas rectangle above the status area, with a dark
semi-transparent box, styled HALLORAN/Crew speaker, two-line clipping and opacity
transitions. Episode transcript is bounded to 16KB and independent of destructive
audio playback. Story beats and map briefings occur once per episode; transcript
and masks persist in Tremor 3 saves. Tremor 2 saves are rejected. Humans can open
the same transcript through Radio log below the view.

Fear sample: terror 0 camera/weapon offsets and fear overlay alphas are 0.
At terror 100 with the default 70% sway profile: sway 1.8997
world units, approximately 1.336 degrees yaw and half
that world-unit vertical movement; weapon Y -2.7560 native units;
desaturation alpha 0.7 and vignette alpha 0.9. These are measured offsets and explicit
Canvas settings, not a claimed Chrome screenshot. See fear-result.json.

`?debug=1` exposes engine/setTerror/giveRounds/warp through browser-only C exports.
Both headless artifacts omit the setters; regression tests check their absence.
Real-engine tests cover episode history across briefings, no duplicate beats,
playback consumption, save persistence and mouse prediction reconciliation.

## Verification and remaining work

Browser, production headless and fixture headless WASM rebuilt; source archive and
artifact hash manifest regenerated. npm test: 120 passing plus one explicit TODO
for full-level completion. Typecheck/build pass; engine:test: 470 checks, 0 failures.
Final verification is recorded in engine/build/engine-test.log locally.

Native 640x400 was attempted by rebuilding the actual raster at that size. It
failed inherited 320-coordinate status widgets (`drawNum: n->y - ST_Y < 0`) before
a valid CPU sample. No working hires setting or hires performance claim is made;
320x200 remains supported. A full hires UI conversion remains unfinished.

Computer-use inventory returned no browsers or apps in this session. Interactive
Chrome paint, pointer lock, audible output and IndexedDB reload remain unverified.
No native radio MP 3 recordings, filtered speech synthesis, sampled/reversed score
layers or wall-traversal acoustic solver were added. Suit light remains a floor
colormap adjustment. The quest planner is topological, not proof of physical
reachability/lift dependencies on arbitrary IWADs. Bot completion remains 0/20;
no normal-spawn completion regression is claimed. The final v4 bot pass has 16 deaths/4 limits; earlier follow-ups had 7 deaths/13 limits. See EVALUATION.md.
