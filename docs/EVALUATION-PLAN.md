# Declared evaluation plan

Declared 2026-10-30, before controller tuning or suite execution.

Tuning cases: s1_corridor, s2_collar, s3_triage. Held-out cases: h1_dark,
h2_door. Each case uses seeds 17 and 83 (two trials per player). Missing level
registrations are errors, never substitutions. Held-out cases must not inform
prompt tuning. test_room is a CI fixture, outside this suite.

Players: baseline_aggressive, baseline_careful, model-history, model-obs-only.
Both model conditions use Vertex gemini-3.5-flash-lite, identical rules and
action vocabulary; history includes at most eight prior summaries/actions.
Live model trials require --live; replay is explicitly mocked CI evidence.

Hypotheses: reading reduces fired-unread and crew deaths; mercy increases crew
saved but consumes steps; bounded history improves navigation/completion under
partial observation relative to observation-only. Report every trial, including
failures, without claiming significance from this small suite.

Metrics: completion, terminal reason, crew killed, crew saved, reads,
fired-unread, final tremor, steps, illegal actions, model calls, fallback moves,
latency, input/output tokens, estimated cost. Cost: price to verify on the Vertex
pricing page on run date; absent verified rates, report null rather than zero.
Record seeds, game version, model/config IDs, date, limits, errors and traces.
Limits: 400 actions, 400 controller calls, 20 seconds per call. Failed calls
consume budget; timeout terminates; three consecutive invalid decisions trigger
a labelled wait fallback. Evaluation score is exit=100, otherwise=0; moral
metrics are descriptive and never contribute to score or the human HUD.

## Implementation verification (2026-10-30)

All eight levels are registered: test_room, hangar, quarantine and the five
unchanged declared situations. CI runs both baselines across seven authored
levels at seeds 17/83 and asserts all 28 exits. Existing evidence is in
eval/integration-baselines.json; it is baseline evidence, not live model results.
The review response passes 105 tests, typecheck and build. No live Vertex calls
or browser play/visual/audio verification are claimed. The standard evaluation
CLI previously encountered uv_os_get_passwd ENOMEM in this Windows sandbox;
integration tests invoke the same runner and controllers directly.

## Amendment 2026-10-30 (pre-tuning)

This interface correction preserves the declared suite, seeds, players and
hypotheses. Summaries now include own exact position, angle, compass heading,
tic, a facing arrow on the seen map and visible supplies, giving the model the
same navigation information already used by baselines. Stun looks identical on
unread crew and Possessed; purge attempts give identity-neutral feedback and
channel/consume charges for either stunned kind. Event output uses an explicit
local whitelist and suppresses hidden activity. Recognition and completed cures
remain legitimate reveals. The paired regression was observed failing first.

Errors are reported separately from illegal actions. Malformed responses retain
known token usage; unknownUsageCalls counts failed/timed-out calls without usage,
so reported tokens may undercount billed usage. A five-minute episode wall-clock
cap supplements the existing limits (terminal reason timeout). No additional API
retries are made. These amendments precede live model tuning/evaluation.


## Amendment 2026-10-30 (engine change, pre-tuning)

This amendment is the user-declared replacement suite for the real-engine change,
provided before tuning the replacement controllers. The earlier TypeScript
situations and all their reported results are **superseded**, not evidence about
Doom play. No held-out map is used to select prompts or controller changes.

- Tuning: Freedoom Phase 1 E1M1, E1M2, E1M3.
- Held-out: E1M4, E1M5.
- Seeds: 17 and 83 for every map/player (two trials each).
- Skill: Doom skill index 2, Hurt Me Plenty. IWAD: bundled Freedoom v0.13.0;
  PWAD: bundled tremor.wad. No proprietary WAD in evaluation.
- Episode ends on level exit, death, 600 actions, 600 controller calls, a
  20-second call timeout, or five minutes total. One action = seven 35Hz tics;
  terminal transitions finish the final interval with neutral input. Score is 100 for exit, 0
  otherwise. Failed calls count; three invalid decisions get a labelled wait.
- Players: aggressive and careful public-observation baselines; Vertex
  gemini-3.5-flash-lite with K=8 history versus observation-only. The model
  receives no engine state, repo, shell, or evaluation tools.
- Report each seed, status, illegal actions, budget hits, call failures,
  latency, tokens (with unknown-usage calls), cost if verified, engine revision
  and artifact hashes. Live trials must be labelled live; CI replays are mocked.

The migration's smoke trials on E1M1 are tuning diagnostics, not held-out
successes. Do not interpret a terminal-reason test or the exit-switch fixture as
proof that a controller traverses an entire map. Retain failed runs honestly.


## Follow-up amendment 2026-10-30 (after declaration; before final rerun)

The declared tuning maps E1M1/E1M2/E1M3, held-out E1M4/E1M5, seeds 17/83,
players and skill remain unchanged. Controller development used only tuning
maps and extra E1M1 seed diagnostics. The follow-up's frozen scripted rerun uses
all 20 declared player/map/seed episodes. No live model runs are authorized here.
The prior 2026-10-30 report is retained; the new report is dated2026-10-31 UTC
(October30 local time). No held-out result was used to change these controllers.

Rule/interface changes since declaration: sector-route objective lock selection
replaces linedef-order selection and prefers normal exits over secret exits;
lighting/interpolation/radio were updated; public observations now include a257x257
map at 16 units/cell with remembered visible floor, mapped D/S/T activation and
key-colour markers, numeric arrow heading, visible elevation and props/barrels,
HUD weapon inventory, a bounded episode radio transcript and a qualitative
moving/blocked/still cue. Humans receive the same activation glyphs and radio log.
World coordinates, hidden actor identities, hidden lines, and exact terror remain
absent from observations. Fine turns, slow/sprint movement and simultaneous
turn/move + fire/READ macros expand the constant legal vocabulary to 36 actions.
All macros still cost seven35Hz tics. Both players get the same interface/actions.

The action/call cap changes from 600 to 1800: six simulated minutes rather than
120 seconds, to budget separate navigation, aiming, door waits and 35-tic READ/
PURGE channels. This is an engineering allowance, not a measured human completion
time. The20-second per-call and five-minute wall-clock caps remain. Completion
must be reported against this new cap, including every failure; do not increase
it further to make a failed traversal look successful. Config IDs record the
change. No claim that the target completion rate has been met is made.

The v4 follow-up adds the open-door `d` cue, scales USE to its64-unit range, bounds
retries across connected markers, clears location inferences after viewport
recentring, and adds diagonal approaches while firing (36 total actions). These
corrections used tuning-map traces. Earlier frozen passes are retained as dated
first-followup/compatibility reports; the latest20-case report is a new full rerun,
not a selection of favourable seeds. Held-out results did not inform these fixes.
Controller/interface source hashes are captured before the final run. Traces are
losslessly gzipped JSONL, retaining every action and public observation. Repeated
runs of fixed seeds are not additional independent statistical trials.

## Amendment ? 2026-10-31 UTC: shared route guidance

The v5 public-route40 config replaces the straight-line human/agent objective
bearing with a shared geometry-derived waypoint, and adds four constant human
control combinations (40 total). Quest planning considers heights and activation
dependencies. The route prefers safe floor over damaging floor and large drops.
The step duration,1800 action/call cap, skill, seeds and tuning/held-out split are
unchanged. This is a public rule/interface change, so comparisons with v4 do not
isolate controller improvements. Only E1M1-E1M3 diagnostics/parameter trials
informed tuning. Fixed-seed repeats are development trials, not new independent
evaluation samples. The final report reruns the full declared suite once.
