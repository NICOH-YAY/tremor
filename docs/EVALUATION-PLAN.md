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

npm test: 15 tests passed; npm run typecheck and npm run build passed.
The evaluation CLI was also typechecked separately (scripts are outside the
repository tsconfig include list). No live Vertex calls were made.

Full suite execution awaits content-worker levels: this branch registers only
test_room. A temporary compiled CLI confirmed the explicit missing-level error
for s1_corridor. No suite result tables or invented live evidence were produced.
The requested npm/tsx command additionally encounters this Windows sandbox's
uv_os_get_passwd ENOMEM in tsx before entering our code. This environment issue
must be resolved on the evaluation host; the package command remains standard.
The skill invocation log intentionally remains empty for actual human sessions.
