**TA verdict: incomplete submission.** The engine works locally; the required live experiment and production evidence are missing. Categories 3 and 5 trigger the stated missing-check cap of **2/4**. The rubric lists five categories despite saying four; I assessed every named check.

Audited commit **9f6b763** on `nicoh-yay/trial-by-combat`. Paths below are relative to `midterms/nicoh-yay/` unless stated otherwise. No tracked working-repository changes.

| Check | Grade | Concrete evidence and exact fix |
|---|---|---|
| **1a** | **Weak** | `docs/rule-source-map.md` labels rules `design`, but several later rows cite “Nicoh approval” without a precise spec locator. **Fix:** give every row a current spec heading, rationale, implementation symbol, and specific test. |
| **1b** | **Met** | `README.md` clearly declares an original, headless game and interface boundaries; `docs/DESIGN.md` excludes interrogation. **Fix:** clarify the README’s incorrect “no assets yet” statement. |
| **1c** | **Weak** | `CREDITS.md` credits agents, generated art, and planned CC0 assets, but art permission is an assertion without linked terms; README still says credits TODO. **Fix:** link applicable generation/reuse terms, state code reuse/license terms, reconcile README. |
| **2a** | **Met** | Ran documented `play -- 42` through hearing, five combat exchanges, judgment, and terminal KO without crashing. `src/game.ts` implements endings. **Fix:** none required for demonstrated loop. |
| **2b** | **Weak** | `src/runner/model.ts` and `episode.ts` implement model-selected actions and labeled fallbacks. Committed `results/samples/` contains baseline traces, **no live model choices**. **Fix:** commit/link genuine live traces showing submitted choices. |
| **2c** | **Met** | `src/game.ts` exposes role-specific observations/actions; hidden-information tests in `tests/game.test.ts`, `agents.test.ts`, and `personas.test.ts` pass. **Fix:** none required. |
| **3a** | **Weak** | Fresh-clone offline tests, typecheck, play, and evaluations run after cached dependency installation. Vertex player remains unverified; ADC setup is only briefly named. **Fix:** document complete authentication/setup and demonstrate baseline plus live player from a clean environment. |
| **3b** | **Met** | `episode.ts` enforces 20-second calls, 30-call cap, retry/fallback limits; `game.ts` caps combat at 18 exchanges. Summaries log terminal reasons; limit tests pass. **Fix:** none required for current supported runner. |
| **3c** | **Weak** | All five test kinds exist, including observed regressions documented in `docs/BUGLOG.md`; **78/78 pass locally**. Workflow exists at repository `.github/workflows/midterm-nicoh-yay.yml`; hosted GREEN evidence is absent. **Fix:** link successful CI for the exact submitted SHA. |
| **3d** | **Missing** | Committed independent-review findings exist in `docs/reviews/claude-independent-review-2026-10-24.md`. No submission implementation-instructions artifact, linked implementation session, reusable skill invoked in two sessions, or `AGENT-TEAM.md`. **Fix:** supply authentic artifacts/session links for three development roles; perform and record two real skill invocations. |
| **4a** | **Weak** | `docs/DESIGN.md` discusses revisions, contextual/global learning, depth, and judgment alternatives, but does not systematically name every open choice and rejected alternative. **Fix:** add a decision table with alternatives, evidence, and student decisions. |
| **4b** | **Weak** | Credible expectimax baseline and separating suite exist. Reproduced S2/Sentinel: baseline **11/20**, random **8/20**, always-BASH **20/20**. Honest failure reporting exists, but no live comparison. **Fix:** interpret baseline weaknesses and actual model comparison in `EVALUATION.md`; superiority is not required. |
| **5a** | **Missing** | No `EVALUATION.md`; no live trials. `experiments/suite.json` has a freeze date, but repeated Adapter-driven tuning undermines held-out evidence. Reports lack submitted SHA/config provenance; costs remain placeholders. **Fix:** preregister fresh untouched cases before further tuning; run ≥3 situations × ≥2 live trials and matched baseline; report all required fields and failures. |
| **5b** | **Missing** | README explicitly leaves personal agent log/limitations TODO; no given/received peer notes. **Fix:** Nicoh writes decisions and limitations personally, obtains both peer-note directions, and explains resulting decisions. |
| **5c** | **Missing** | No recording link. **Fix:** provide 3–5 minutes showing autonomous model choices and stated limits. |

**Fresh-clone execution and failures**

- Local clone and branch checkout matched the requested SHA.
- Initial short Windows temp-path access failed; corrected using the long path. This was an audit-environment issue.
- Documented `npm install` stalled under restricted networking and was interrupted. Before dependencies completed, test/typecheck failed with missing `vitest`/`tsc`. Cached offline installation succeeded.
- Then: **78 tests passed**, typecheck passed, README evaluations passed: **960 episodes** and **320 depth-1 episodes**.
- `npm run balance`: **exit 1**, correctly reporting unmet criterion (a); all **3,520 episodes** executed.
- Live execution intentionally not attempted: no authorization to spend credits.
- GitHub PR/CI queries failed due network restrictions. Allowed-path diff passes; PR existence and hosted CI remain unverified.

**Remaining bugs/evidence defects**

`agent-config.json` is descriptive: runtime limits/history are hardcoded elsewhere, so editing configuration does nothing. `src/runner/report.ts` prints only the first episode’s posterior as the group posterior. README-linked `results/comparison.md` is stale: S1 posterior **1/2**, versus reproduced **121/202**; historical result directories need explicit version labels.

**Prioritized fixes**

**A — Codex can build:** configuration loading/validation; report provenance and posterior aggregation; coherent report/trace links; reproducible setup instructions; committed implementation instructions and reusable skill.

**B — Nicoh personally:** authorize provider/credentials and live costs; choose fresh held-out evaluation; write AGENT-TEAM/limitations; complete genuine skill sessions, peer playtests, recording, and upstream PR; link exact-SHA green CI. Also resolve whether this **original game** satisfies the course’s **classic reconstruction** requirement.