# Declared evaluation plan

## Declaration timeline (read first)

**Summary for graders.** The real-engine suite was declared on 2026-10-30, although the initial controller migration and baseline report share that declaration commit.
Baseline tuning used only E1M1-E1M3, as recorded in the amendments and review response.
E1M6/E1M7 were added before any model trial and never used to change a controller: the baseline controllers were unchanged after their first run, and the final clean run reproduces all 28 baseline gameplay outcomes and metrics ([comparison evidence](#baseline-reproduction-evidence)).
No model trial before the 2026-10-31 freeze was found; the one interrupted live attempt used tuning map E1M1 and led only to lossless prompt encoding, with associated configuration and accounting corrections.
E1M4-E1M7 were therefore unseen by the model players before the final suite, and E1M6/E1M7 are clean held-out maps for every player in the sense that no tuning used them.

Times below are ISO 8601 commit times (author and committer times agree for the
suite declaration and first later tuning commit). Run times come from recorded
run IDs, not commit times. The original declarations and amendments remain below.

| Date/time (ISO) | Commit | Event | Results seen at that point |
|---|---|---|---|
| 2026-10-30T12:02:32-04:00 | `ac7be97fe6f8d81285353bda4251c57e5e59ee8a` | First committed real-engine declaration: tune E1M1-E1M3, hold out E1M4/E1M5; seeds 17/83; aggressive, careful, model-history K=8, model-obs-only; skill 2; 600 actions/calls, 20 s/call, five minutes/episode | Superseded TS evidence; this same commit also contains the controller migration and a baseline-only report, run 2026-10-30T15:59:51.392Z |
| 2026-10-30T21:00:04-04:00 | `d608349868110a05a394c330b146cca79dfc697b` | First subsequent baseline tuning commit; navigation/READ changes and expanded observation/action prompt; caps 600 to 1800 | Baseline diagnostics existed; amendment says only E1M1-E1M3 informed changes, not E1M4/E1M5; no recorded model trial |
| 2026-10-30T21:32:50-04:00 | `93f5646ed35056468aa6e0164520708eb438c36d` | Shared route guidance and 40 actions, for humans and every player; diagnosed baseline policies | Baseline suite results existed; amendment attributes tuning only to E1M1-E1M3; no recorded model trial |
| 2026-10-31T01:24:08-04:00 | `c6316ff03972c0a2aaf8ccdf44386357e660a674` | Survival tuning: bounded retreat, repeated-cell recovery, pickups, READ tracking; caps 1800 back to 600 | Baseline E1M4/E1M5 results seen; amendment says they selected no changes; no recorded model trial |
| 2026-10-31T02:03:43-04:00 | `9927bfee94a74b39a0e20fe029905ca4f139a47f` | E1M6/E1M7 freeze; C ceiling reconciled to 600; careful policy and public-rule/prompt corrections | E1M4/E1M5 seen by baselines. E1M6/E1M7 added before the final baseline regeneration (05:54:45.516Z, dirty tree), after review-driven fixes; baseline controllers unchanged through the clean final run; no recorded model trial |
| 2026-10-31T06:04:04.607Z | Reviewed at `9927bfe`; review committed as `203810d` at 2026-10-31T02:12:29-04:00 | First evidenced live model attempt, interrupted before encoding amendment | Retained model-history traces on E1M1/17 and E1M1/83; no completed results JSON for this attempt |
| 2026-10-31T02:18:50-04:00 | `8f0e4a9dc937904ec47b1fe00045315330a112ae` | codex-doom13 lossless row-RLE/reversible history-delta prompt encoding; explicit model config and accounting | Earlier live E1M1 attempt exposed prompt-size/token problems. Amendment says held-out outcomes did not tune encoding; this change was after a model trial, before the final suite |
| 2026-10-31T06:19:01.385Z | Run revision `8f0e4a9`; results committed as `13856cb608514721cf6e190dc74f36a684c32e3e` at 2026-10-31T04:09:02-04:00 | Clean final live suite, all 56 episodes | Prior baseline results and interrupted E1M1 model attempt; final results retained unchanged |

The real-engine suite was declared on 2026-10-30 as a pre-tuning replacement
([original request](agent-sessions/codex-doom4.md)). Its first declaration commit
precedes the first subsequent baseline tuning commit. Git does not establish a
separate committed declaration before the initial controller migration: that
migration and its baseline report are in the declaration commit itself. The
historical phrase "before controller tuning" records the request's ordering,
not independently timestamped edits within that commit.

The follow-up and survival amendments state that baseline tuning used only
E1M1-E1M3, and that inspected E1M4/E1M5 baseline results selected no changes.
E1M6/E1M7 were added as extra clean held-out maps for baselines; they were already
executed in the session's final dirty-tree regeneration after the review-driven
changes, before the freeze was committed; their results selected no controller changes. No live model
trial before the 2026-10-31 freeze was found in result-file history, retained model
traces or session/review records. For the Gemini players E1M4-E1M7 were therefore
unseen held-out maps before the final run; the earlier model attempt used E1M1.
This describes per-player exposure, not blindness of the developers to baseline
outcomes. Historical result tables retain their original split labels.

### Baseline reproduction evidence

The [codex-doom12 request, item 5](agent-sessions/codex-doom12.md) requires
freezing E1M6/E1M7 and then regenerating the scripted suite; the
[session result](agent-sessions/codex-doom12-result.md) reports that final evaluation.
The [review response](reviews/review-response-2026-10-31.md#independent-review-mapping)
attributes careful/READ changes to independent-review M1, fixed on E1M1 tuning
only with bounded close READ, health>=90 reading and close combat.
Public-rule corrections address M2 (purge), M3 (corpse/drop identity leaks) and
M4 (contradictory contracts); audit-rubric m3 records the expanded observation
prompt, and audit-rubric M4 explicitly records the freeze before the expanded
baseline run and no subsequent tuning on those maps.
These records place the changes before the final regeneration, not in response
to E1M6/E1M7 outcomes.

`git diff --stat 9927bfe 8f0e4a9 -- src/agent src/eval` lists model/prompt,
types/config and runner changes, but no change to `src/agent/baselines.ts`,
which implements both scripted controllers. Both the
[first expanded report](../eval/results/2026-10-31-2026-10-31T05-54-45-516Z-results.json)
and [clean final report](../eval/results/2026-10-31-2026-10-31T06-19-01-385Z-results.json)
record its SHA-256 as
`c57d85a7ffb824f6fd6cd7f004859ba1f9a10d1bdf414615cc0b3e8209767c38`.
Matching by player, map and seed, all 28 baseline rows reproduce every gameplay
outcome and metric, including all eight E1M6/E1M7 rows.
Only latency and trace paths differ among shared fields; the final report adds
`callTimeouts` and `episodeTimeouts`, both zero for every baseline row.
The runner changed for validation, timeout/accounting and final-key counting,
but those changes did not change these baseline outcomes or gameplay metrics.
The baseline controllers were not changed after E1M6/E1M7 were first run, and
the final clean run reproduces every baseline outcome of that first run, so the
records support that no baseline tuning used held-out results.

The final run retains the 2026-10-30 maps, seeds, four players, skill and restored
600/600/20 s/five-minute limits, plus E1M6/E1M7. Shared route guidance applies
equally to every player. It was not the only intervening public change: the
amendments also record objective selection, observation/action expansion and
identity-neutral purge/terror/drop corrections. Those changes and both limit
changes preceded the first evidenced model attempt. The lossless prompt encoding
did not. The amendments report no held-out-driven tuning; git alone cannot prove
which observations informed every development decision. The 9927bfe diff also
changes careful combat/READ policy; it must not be described as documentation only.

Evidence: `git log --follow -- docs/EVALUATION-PLAN.md`,
`git show ac7be97:docs/EVALUATION-PLAN.md`, and the baseline-file history;
[second review](reviews/review.md) (M1 names the live 06:04:04.607Z trace),
[codex-doom13 request](agent-sessions/codex-doom13.md) (stopped live calls), and
[final report](../eval/results/2026-10-31-2026-10-31T06-19-01-385Z-results.json).
The interrupted attempt's retained ignored traces are
`eval/traces/2026-10-31T06-04-04-607Z-model-history-E1M1-17.jsonl.gz`
(109 rows, ending at step 108 with a controller-call error) and
`eval/traces/2026-10-31T06-04-04-607Z-model-history-E1M1-83.jsonl`
(51 rows, no terminal record). No earlier smoke/demo model result was found.
Result-file dates support this ordering. The first engine baseline report has
run ID 2026-10-30T15:59:51.392Z, local filesystem creation time
2026-10-30T16:04:18.8199600Z and last-write time
2026-10-31T00:14:55.4936439Z. The fresh-map baseline report has run ID
2026-10-31T05:54:45.516Z and creation/last-write time
2026-10-31T05:55:22.9942986Z. The final live report has run ID
2026-10-31T06:19:01.385Z and creation/last-write time
2026-10-31T08:05:43.3005937Z. Filesystem dates describe this checkout and are not
independent proof of declaration time. All 21 JSON reports currently under
`eval/results/`, including `exploratory/`, were inspected: only the final
06:19:01.385Z report has model-player rows (28, mocked=false). Result-path history
was also checked for earlier or removed reports; no pre-freeze live report was
found. The interrupted attempt survives as traces and review evidence instead.
The later live demo is documented separately in
[codex-doom20](agent-sessions/codex-doom20.md) and committed in `3c47234`
(2026-11-02T14:11:03-05:00).

Final freeze before model trials: 2026-10-31, Codex session codex-doom 12, before any model trial.
Tuning: E1M1/E1M2/E1M3. Seen: E1M4/E1M5 (baseline results already inspected;
no longer clean held-out for baselines). Fresh held-out: E1M6/E1M7. No controller/prompt tuning
may use these fresh held-out results. Two RNG starts, 17/83, per player/map.
Players: aggressive, careful, Vertex model-history K=8 and model-obs-only.
All use public observations and 40 constant seven-tic actions, skill index 2.
Limits: 600 actions, 600 calls, 20 seconds/call, five minutes/episode.
Failed calls count; three invalid decisions (errors do not reset this streak)
produce a labelled wait. Timeouts terminate. Exit=100, all other scores=0.
The live suite ran on 2026-10-31 with --live. See [the evaluation](../EVALUATION.md).
Report completion, limits, illegal actions, latency, tokens, dated cost, progress,
objectives, final health, kills, crew killed/saved, reads, fired_unread and terror.
Seeds are 8-bit RNG table starts; seeds congruent modulo 256 are identical.

| Date | Amendment | Results already seen? |
|---|---|---|
| 2026-10-30 | TS suite replaced with real-engine E1M1-E1M5 | TS evidence superseded |
| 2026-10-30 | 600 raised to 1800 for navigation/channel allowance | Development diagnostics existed |
| 2026-10-31 | Survival follow-up restored 600 | Baseline tuning/results existed |
| 2026-10-31 | Codex reconciles C ceiling to declared 600; freezes E1M6/E1M7 | E1M4/E1M5 seen; no live model trials |

Hypotheses: careful reading reduces fired_unread/crew deaths; mercy saves crew
at a step cost; K=8 memory improves navigation against observation-only.
No significance claim from two seeds. Fixed-seed reruns are not independent trials.

Secondary objective count is distinct key types collected plus a completed exit.
Switch-only subtasks are excluded. Route percent is a sector-hop distance proxy,
not a proof of traversability. This clarifies the 2026-10-31 secondary metric after
baseline diagnostics; no model trials or controller retuning used these metrics.

Original declarations and subsequent amendments follow in date order.

## History

The following is retained as a superseded declaration record, not current rules.

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
The prior 2026-10-30 report is retained; the new report is dated 2026-10-31 UTC
(October 30 local time). No held-out result was used to change these controllers.

Rule/interface changes since declaration: sector-route objective lock selection
replaces linedef-order selection and prefers normal exits over secret exits;
lighting/interpolation/radio were updated; public observations now include a 257x257
map at 16 units/cell with remembered visible floor, mapped D/S/T activation and
key-colour markers, numeric arrow heading, visible elevation and props/barrels,
HUD weapon inventory, a bounded episode radio transcript and a qualitative
moving/blocked/still cue. Humans receive the same activation glyphs and radio log.
World coordinates, hidden actor identities, hidden lines, and exact terror remain
absent from observations. Fine turns, slow/sprint movement and simultaneous
turn/move + fire/READ macros expand the constant legal vocabulary to 36 actions.
All macros still cost seven 35Hz tics. Both players get the same interface/actions.

The action/call cap changes from 600 to 1800: six simulated minutes rather than
120 seconds, to budget separate navigation, aiming, door waits and 35-tic READ/
PURGE channels. This is an engineering allowance, not a measured human completion
time. The 20-second per-call and five-minute wall-clock caps remain. Completion
must be reported against this new cap, including every failure; do not increase
it further to make a failed traversal look successful. Config IDs record the
change. No claim that the target completion rate has been met is made.

The v4 follow-up adds the open-door `d` cue, scales USE to its 64-unit range, bounds
retries across connected markers, clears location inferences after viewport
recentring, and adds diagonal approaches while firing (36 total actions). These
corrections used tuning-map traces. Earlier frozen passes are retained as dated
first-followup/compatibility reports; the latest 20-case report is a new full rerun,
not a selection of favourable seeds. Held-out results did not inform these fixes.
Controller/interface source hashes are captured before the final run. Traces are
losslessly gzipped JSONL, retaining every action and public observation. Repeated
runs of fixed seeds are not additional independent statistical trials.

## Amendment - 2026-10-31 UTC: shared route guidance

The v5 public-route 40 config replaces the straight-line human/agent objective
bearing with a shared geometry-derived waypoint, and adds four constant human
control combinations (40 total). Quest planning considers heights and activation
dependencies. The route prefers safe floor over damaging floor and large drops.
The step duration, 1800 action/call cap, skill, seeds and tuning/held-out split are
unchanged. This is a public rule/interface change, so comparisons with v4 do not
isolate controller improvements. Only E1M1-E1M3 diagnostics/parameter trials
informed tuning. Fixed-seed repeats are development trials, not new independent
evaluation samples. The final report reruns the full declared suite once.

## Survival follow-up — 2026-10-31 UTC

The current session explicitly restores 600 actions and 600 controller calls,
with unchanged E1M1–E1M3 tuning / E1M4–E1M5 held-out maps, seeds 17/83, skill 2,
seven-tic actions, 20-second call and five-minute episode limits. This supersedes
all earlier 1800-budget statements for the current report; it does not move the
suite or increase a budget to obtain success. The runner and diagnostic harness
impose 600; the unchanged C artifact retains its higher internal safety ceiling.

Current config: `tremor-engine-v6-survival-route40-600-k8`. No new observation or
human-control rule was added. Controller tuning used only tuning maps, including
failed repeated development trials. An initial full run's aggressive E1M1 failure
was corrected from tuning-map evidence by restoring its original close-combat
branch, then all 20 episodes were rerun. Held-out results selected no changes.
Final careful tuning completion is 2/6, below 4/6. See dated EVALUATION.md for the
full failures and split-labelled report; no live model trials were run.

## 2026-10-31 codex-doom13 prompt/accounting amendment

Before further live trials: current public observation is losslessly row-RLE
encoded with only unknown borders omitted and explicit crop offsets; history K8
uses reversible deltas. No known cells or HUD/entity/story fields are removed.
Both memory conditions share this encoding. Global standard gemini-3.5-flash-lite,
explicit temperature 0.2; no regional fallback. Prices dated 2026-10-31 in
src/eval/model_config.ts. A 20s call timeout terminates with reason timeout;
report call and episode deadline counters separately. No live trials in this
session; held-out outcomes are not used to tune this encoding.
