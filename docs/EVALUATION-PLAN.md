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
