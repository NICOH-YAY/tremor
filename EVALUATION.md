# Real-engine evaluation status ? 2026-10-30

The agent now plays the same doomgeneric/Tremor WASM engine and Freedoom data as
the browser. The [pre-tuning amendment](docs/EVALUATION-PLAN.md) declares tuning
E1M1/E1M2/E1M3, held-out E1M4/E1M5, seeds17/83, skill Hurt Me Plenty. Old
TypeScript suite results are **superseded**; their28/28 custom-map successes say
nothing about engine completion. Historical files remain with
[an explicit superseded notice](eval/SUPERSEDED.md).

## Current baseline evidence

A frozen controller pass over all five declared maps at both seeds completed20
crash-free episodes. No changes to controllers/prompts used held-out results.

| Player | Episodes | Exits | Deaths | Step limit | Call/timeout limit | Illegal actions | API failures |
| --- | --- | --- | --- | --- | --- | --- | --- |
| aggressive | 10 | 0 | 2 | 8 | 0 | 0 | 0 |
| careful | 10 | 0 | 4 | 6 | 0 | 0 | 0 |

This is **0/20 completions**, not a successful navigation result. The local
line-only map and coarse movement/aim macros leave the heuristics prone to
circling, blocked paths and combat stalls. Careful reading/cure behavior is
implemented and unit-tested but is not evidence of reliable whole-map mercy or
navigation. Two RNG-table starts are limited diversity, not statistical confidence.

[Per-map/seed table](eval/results/2026-10-30-table.md) and
[full metrics/config/artifact hashes](eval/results/2026-10-30-results.json)
identify the exact uncommitted engine build. Controller latency is decision time,
not total rendering/simulation time. Baseline API cost is0, with no model tokens.
Full action traces are generated locally under gitignored `eval/traces/`; a
[bounded trace excerpt](eval/examples/engine-baseline-trace.json) is retained for
review. Rerun from this folder:

```sh
npm run eval -- --players baseline_aggressive,baseline_careful
```

No live Vertex trials have been run. K=8 history vs observation-only is wired to
`gemini-3.5-flash-lite`, with the same public summary/actions as baselines. Model
success, token totals, dated verified prices and cost comparisons remain
unavailable. Estimated model cost stays null. Failed transport/timeout calls count
against the call budget; unknownUsageCalls identifies incomplete token accounting.
CI's fake controllers/replays are explicitly labelled mocked and never substitute
for live evidence.

## Verification and limitations

Local `npm test`, `npm run typecheck`, and `npm run build` pass. CI now runs the
same commands with bundled production/test headless artifacts; no emsdk is needed.
The actual remote GitHub Actions run has not been executed in this session.
Engine tests cover ammunition, trauma and health invariants, harmless crew,
constant legal/illegal actions, deterministic replay, observation-independent map
history, real exit scoring, pre-reveal identity pairs, observed stun/purge
regressions, and step/call/timeouts with failed/invalid-call accounting.

The successful exit test places the player beside a real E1M1 exit switch, then
uses ordinary wait/USE macros. It verifies the engine's exit boundary and score,
**not traversal from the normal spawn**. A separate600-step E1M1 test verifies
step_limit. Full-map successful-path evidence is still missing.

Production browser-WASM smoke evidence (Node platform callbacks, not a fresh
interactive browser playtest): one initialization despite a deliberate second
entry call; two simultaneous intro waiters both resume; three frames drawn;
active music with nonzero PCM samples (observed peak3048). Pointer-lock rejection
and intro click behavior are tested with DOM helpers. Fresh static-site browser
playtesting, audio-device playback, and a final recording remain to be done.

During migration a real engine run exposed a crash from Doom-II-only gore
sprites missing in Freedoom1; guarded spawn and crew-frame checks now have actual
engine regressions. The course startup regression now has manual-entry guards,
a cached single module promise, and one intro listener resolving all waiters.

Submission work still includes live model comparisons, independent read-only
review, Nicoh's own agent-team/evaluation commentary, peer notes, recording and
submission links. Nothing was committed by this implementation session.
