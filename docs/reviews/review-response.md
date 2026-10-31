# Second independent review response - codex-doom13 (2026-10-31)

Source: [unaltered review](review.md). This is a new separate Codex session;
no commits or live model calls. All review findings are mapped below. Exact
validation and run paths are in [skill invocations](../SKILL-INVOCATIONS.md).

| Finding | Status and concrete response |
|---|---|
| M1 prompt/cost | Fixed encoding/accounting in src/agent/prompt.ts, model_rules.ts, model_player.ts, src/eval/model_config.ts and runner.ts. Unknown-only borders removed with explicit offsets; row RLE preserves every known cell. K8 reverse deltas reconstruct every historical observation, including full maps, instead of repeating full maps. Both memory conditions share current encoding. 24,000-character preflight rejects rather than truncates; output cap 256. Tests round-trip maps and historical fields, enforce recorded E1M1 budget and mock the model. Exact Gemini <8k input-token target remains for human live validation; offline estimates below are not vendor counts. |
| M2 stale status | Replaced docs/HORROR-STATUS.md with current design/evidence links and candid pending work. |
| M3 second session | Invoked tremor-level-check by name in separate session codex-doom13; before/after entries in docs/SKILL-INVOCATIONS.md. |
| M4 rationale | docs/DESIGN.md Parameter rationale covers tuned rules and considered alternatives, explicitly design judgments without invented balance trials. Internal bitmasks/cosmetics labelled implementation details in docs/rule-source-map.md. |
| M5 baseline breadth | Limitation retained, not tuned against held-out outcomes. README and EVALUATION/report generator state seen/held-out comparisons concern route progress/survival, not demonstrated completion. |
| M6 run provenance | scripts/eval.ts captures revision, dirty state, source/artifact hashes before the episode loop; dirty stays dirty. Reran frozen scripted suite. Clean committed evidence remains pending because Codex cannot commit; human/Claude must commit then rerun. No false clean label. |
| m1 slow call | Kept declared 20-second call timeout terminating episode with timeout reason. runner.ts counts callTimeouts separately from episodeTimeouts; EVALUATION and report generator display both. |
| m2 C ceiling | Kept 600 in C; runner rejects maxSteps outside integer 1..600 before reset. Existing 600-step real-engine test plus new >600 rejection and lower-limit tests cover agreement. CONTRACTS documents ceiling. No C change/rebuild. |
| m3 model config/tests | model_config.ts centralizes model/global location/temperature 0.2; regional fallback removed. Baseline-only report model is null. Injected generator tests legal/rules/compact map, JSON parsing, malformed-response usage; reverse-history regression checks all fields. |
| m4 aggregate budget | Existing deliberate hostile-count disclosure retained; added explicit note in model RULES so model and humans understand limitation. Changing starting rounds would change game balance. |
| m5 shared guidance | Retained designed public guidance; EVALUATION/report generator explicitly disclose unseen geometry/key dependencies and easier-than-vision-only navigation. |
| m6 source archive | README path corrected to public/engine/source.zip. |
| m7 rule labels | Crew fraction row corrected from unsupported observed claim to design probability, with exact TR_MapSpawn locator and rationale. It no longer claims a nonexistent seed/fraction test or empirical map rate. Controls manual row labelled design. |
| m8 table | scripts/report-evaluation.mjs header/separator/data widths match; regenerated EVALUATION.md adds unknown usage and cost and separate deadline table. |
| m9 browser claim | docs/DESIGN.md, HORROR-STATUS and prior author response corrected: TAB-closed route gate is 35 advancing game tics; story polls every 250 ms regardless of visibility. No visibility throttle claimed. |
| m10 chaingunners | Documented out-of-suite limitation in DESIGN: TR_Human includes chaingunners but crew spawn excludes them; Episode 1 suite has none. No C change made for unsupported maps. |
| m11 ROUTE_MAX | Documented stale-cue early-return limitation and 1,048,576-cell threshold in DESIGN; not reached by suite. Extending map support needs correction, not a claim of universal routing. |
| m12 Pages fixtures | vite.config.ts removes doom-test.* from built dist/engine-headless; Pages uploads dist. Local public fixtures remain for tests. Production output inspected after build. |
| m13 residual strings | Prior author response now distinguishes displayed Freedoom BEX replacements from retained internal GPL mode/episode strings. Licensed upstream constants retained. |
| m14 result clutter | Superseded diagnostic JSON/tables moved into eval/results/exploratory with README; parent README indexes current report and retained prior reference. Outcomes unchanged. |
| m15 submission copy | Existing root CI/Pages workflows retained for this standalone repository. Course-copy restriction remains: copy only midterms/nicoh-yay plus midterm-nicoh-yay.yml. Course workflow already uses Node 24 and scoped cache path; npm test executes shipped C suite. No course PR/commit authorized here. |
| m16 runner details | runner.ts observes final keys after the final action, counting final-step acquisitions. Labelled fallback wait remains separately counted; outcomes stay evaluator-only. |

Pricing verified directly on the standard/global section of
[Vertex pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing) on
2026-10-31: Gemini 3.5 Flash-Lite $0.30/1M input, $2.50/1M output,
$0.03/1M cached input (unused). The separate Flex/Batch discount table is not
used. Canonical values/date/URL are in src/eval/model_config.ts and copied to
report JSON. Output/reasoning usage is included; unknown transport usage makes
costs lower bounds, with unknownUsageCalls explicitly reported.

## Offline prompt measurements

[Per-call exact measurements](prompt-size-e1m1.json) cover all 285 observations
from the recorded E1M1 death trace, with the recorded actions and K8 history.
Reproduce with `node --import ./scripts/typescript-loader.mjs scripts/measure-prompts.ts`.
Before uses the original model rules at revision 203810dc; after uses current
lossless encoding. The recorded observation input is identical in both cases.

| Prompt | Mean chars/call | Maximum chars/call | Mean / maximum token planning estimate (chars/4) |
|---|---|---|---|
| Before history | 600,154 | 612,361 | 150,038 / 153,090 |
| After history | 11,340 | 17,640 | 2,835 / 4,410 |
| After obs-only | 8,340 | 8,960 | 2,085 / 2,240 |

History mean character reduction: 98.1%. Character/4 figures are estimates,
not measured Gemini tokens. The review's actual prior live usage was roughly
78k input tokens/call with history; there are no new live usage numbers.
Actual post-change vendor tokens and the <8k target require the human's next
live run. No paid tokenizer or model endpoint was called. Character preflight
and tests constrain growth without removing information.
## Music freeze regression

2026-10-31 — Codex; no commit, live evaluation, rule changes, or C changes.

- Root cause: `public/engine-page.js` called `_tremor_pressure()` from
  `updateMusic()` during the initial `settings.apply()`, before `callMain()`.
  `engine/tremor/tremor.c:535` traverses `thinkercap.next`; before level
  initialization the sentinel is not linked, so this WASM call loops forever.
  This happens for every music style, including saved Horror score settings.
- Fix: settings apply the score using the last pressure sampled by
  `public/horror.js`'s gameplay frame callback (initially zero). Settings no
  longer query level data. Layered remains the default, with the existing
  audible score and fear/pressure mix, cutoff and pitch behavior preserved.
- Reproduction: `npx.cmd vitest run tests/start-flow.test.js` **before the
  fix: 3 failures**, each child killed with `ETIMEDOUT` at 10 seconds
  (Layered, Horror, Original; total 30.16 seconds). **After: 3 passed**
  (1.54 seconds). The same regression tests are included in the full suite.
- Harness: `tests/start-flow-smoke.mjs` executes the real `engine-page.js`
  Play handler in happy-dom with the shipped production WASM and WADs.
  Only IndexedDB mounting/syncing is replaced with an in-memory persistence
  adapter. Fake Web Audio implements ScriptProcessor, compressor, filters,
  oscillators, gains, convolver and buffers; AudioParam assignments and
  automation reject non-finite numbers. It reaches the intro waiter, clicks
  Continue, renders at least three frames, invokes three audio callbacks,
  checks finite samples, and reapplies settings after level initialization.
  A parent-process timeout catches synchronous hangs that an in-page timer
  cannot. A direct Layered run reported one callMain, one intro, three frames,
  three audio callbacks and five rAF callbacks.
- Validation: `npm.cmd test` **57 tests passed (12 files)**;
  `npm.cmd run typecheck` passed; `npm.cmd run build` passed (Vite retains
  the existing unresolved-at-build-time `./art/title.jpg` warning);
  `npm.cmd run engine:test` **508 checks, 0 failures**.
  No new Chrome/device-audio listening result is claimed.

