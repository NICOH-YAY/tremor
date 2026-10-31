# Current real-engine contracts - 2026-10-31

Node 24. src/player_interface.ts owns five operations. Each reset creates an
independent synchronous WASM instance privately held in WeakMap. No handle is
provided to controllers; in-process imports are not a security sandbox.

- reset(seed,levelId='E1M1'): safe integer, E1M1-E1M9, seed&255 selects RNG start
  before spawn. Skill 2, bundled Freedoom and Tremor WADs.
- observe(state,player_id='player'): detached JSON; unknown player throws. Fields:
  tic,health,armor,rounds(shared HUD budget),purge(charges),weapon,weapons,keys,
  aim(steady/shaky/very shaky trauma),terror(steady<25/shaken<50/terrified<80/
  breaking),motion(moving/blocked/still),heading_deg,map_cell_units=16,automap,
  entities,objective,objective_bearing,objective_distance,radio_log,events,summary.
  Summary serializes every other field. Exact trauma/terror/kills are outcome-only;
  numeric rounds/charges are legitimate public resources. Initial rounds deliberately
  disclose hostile count+1. Observation does not advance time/RNG/planning.
- legal_actions(state,player_id='player'): constant 40 IDs below even at terminal;
  unknown player/state throws. No identity/inventory/range filtering.
- step(state,player_id,action): two-argument shorthand retained. Live action advances
  exactly 7 G_Ticker calls; neutral tics finish terminal macro. Unknown action/player
  returns valid=false with reason and idles 7 tics. Known ineffective attempts valid.
  Terminal attempts do not advance. Events are up to 5 displayed messages this step,
  cleared at its start; radio is separate persistent history.
- outcome(state): ongoing/terminal, reason, score(exit 100 else 0), evaluator kills,
  crew killed/saved,reads,fired_unread,rounds,trauma,terror,tics,final health and
  route_progress_pct. No outcome passed to controllers.

Entities expose bearing_deg(positive left),distance(Doom units),elevation_deg,type;
90-degree horizontal cone plus P_CheckSight. Unread humans share unknown figure,
no IDs. Full READ/PURGE are deliberate reveals; STUN and interrupted PURGE feedback
match identities. Human corpse fear/drop rules identical. Map 257x257 north-up,
16 units/cell, recenters near edge, no world origin/coordinates. ? unknown, . seen
floor, # mapped barrier,D/d closed/open manual door(56 unit aperture),S switch,T
crossing,b/y/r closed locks,>^<v player. Mapped drawable lines only, no secret
activation markers. Human map intentionally shares activation classification.

Objective is designed full-geometry guidance shown identically to human TAB and
agents: it reveals unseen dependencies. Secret lines block lattice. Bearing is
a smoothed waypoint up to 256 units ahead; distance to quest target near<128,
nearby<512,far. No graph/coordinates/actor identities leave planner. Not a universal
lift/teleporter solver. Radio transcript 16KB, separate playback queue.

All actions cost 7 tics(0.2s). Fine/small/medium/large turns~2/10/45/90 degrees.
Forward/back 25,strafe 24,slow 12,sprint 50 command units/tic. Compound actions hold
both controls. USE edge-triggered; other action releases. READ/PURGE35continuous
tics. Constant append-only C ABI order:

0. `forward` (7 tics)
1. `back` (7 tics)
2. `strafe_left` (7 tics)
3. `strafe_right` (7 tics)
4. `turn_left_small` (7 tics)
5. `turn_left_large` (7 tics)
6. `turn_right_small` (7 tics)
7. `turn_right_large` (7 tics)
8. `fire` (7 tics)
9. `use` (7 tics)
10. `read` (7 tics)
11. `stun` (7 tics)
12. `purge` (7 tics)
13. `wait` (7 tics)
14. `weapon_fist` (7 tics)
15. `weapon_pistol` (7 tics)
16. `weapon_shotgun` (7 tics)
17. `turn_left_fine` (7 tics)
18. `turn_right_fine` (7 tics)
19. `forward_slow` (7 tics)
20. `advance_fire` (7 tics)
21. `strafe_left_fire` (7 tics)
22. `strafe_right_fire` (7 tics)
23. `back_fire` (7 tics)
24. `sprint` (7 tics)
25. `turn_left_small_fire` (7 tics)
26. `turn_right_small_fire` (7 tics)
27. `turn_left_fine_fire` (7 tics)
28. `turn_right_fine_fire` (7 tics)
29. `turn_left_small_read` (7 tics)
30. `turn_right_small_read` (7 tics)
31. `turn_left_fine_read` (7 tics)
32. `turn_right_fine_read` (7 tics)
33. `advance_read` (7 tics)
34. `approach_left_fire` (7 tics)
35. `approach_right_fire` (7 tics)
36. `turn_left_medium` (7 tics)
37. `turn_right_medium` (7 tics)
38. `advance_left` (7 tics)
39. `advance_right` (7 tics)

Runner 600 actions/calls,20s/call,300s/episode. Failed calls count with no gameplay
step. Errors sanitized; invalid streak survives errors. Three invalid decisions
produce labelled wait fallback, never a model move. Replays mocked. Natural ending
wins over later limit. Reasons exit/dead/step_limit/call_limit/timeout.

Progress is evaluator-only sector-hop distance proxy toward normal exit,0-99,
100 only at exit; ignores locks/heights, not a traversability proof. objectivesReached
counts distinct key types collected plus a completed level exit; switch-only subtasks are not counted. Final
health/kills/moral metrics apply to all players. Tremor 3 saves persist identities,
resources,trauma,radio/corpse flags; partial channels reset on load. Browser pitch
is clamped Y-shear. legacy/ is excluded from every active pipeline.

## Lossless model prompt encoding (codex-doom13)

The course Observation and baseline inputs remain unchanged. Current model input
serializes every observation field once, replacing automap with row-rle:
width/height are original dimensions, x/y are zero-based column/row crop offsets.
Only all-unknown outer rows/columns are omitted; every omitted cell is `?`.
Each crop row is space-separated character+decimal-count runs (`?120 .5 #3`).
Rows are north-to-south, runs west-to-east. An empty crop means all unknown.
trailingNewline preserves the exact raw map string terminator.

K=8 history contains newest-to-oldest reverse deltas, anchored to Current.
Overwrite fields, resize the raw map string to mapLength, then replace each
mapPatches [zero-based raw string offset, old text] to recover the previous
observation. Offsets count newline characters. Unchanged fields inherit; action
was chosen from the reconstructed observation. This is reversible, including
viewport shifts, radio/events, inventory and full historical maps. Summary is a
redundant serialization and is reconstructed from these same fields.

Both model conditions get the same lossless current view; obs-only gets no past
views. Model config/pricing lives in src/eval/model_config.ts: global standard,
temperature 0.2, no regional fallback or cache. Failed transport usage is unknown;
estimated cost is a lower bound when unknownUsageCalls > 0. Output accounting
includes reasoning tokens. Call timeout ends the episode, reason timeout;
callTimeouts and episodeTimeouts identify the triggering deadline.
Runner maxSteps is an integer 1..600: larger requests are rejected before reset,
matching the engine's fixed 600 ceiling. Natural terminals retain precedence.

Preflight rejects prompts above 24,000 characters before any network request (no truncation); output cap 256 tokens. This is a character budget, not an exact Gemini tokenizer limit. Offline E1M1 character measurements and chars/4 planning estimates are in docs/reviews/prompt-size-e1m1.json. Real Gemini input token counts are recorded in the 2026-10-31 live results linked from [EVALUATION](../EVALUATION.md).
