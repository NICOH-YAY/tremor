Implemented the approved mechanics, but **balance remains unmet**. Always-strike still wins canonical S1 **16/20**.

Changed files under `midterms/nicoh-yay/`:

- Engine/controllers: `src/game.ts`, `src/sim/{rules,evidence}.ts`, `src/agents/index.ts`, `src/runner/{cli,prompt}.ts`.
- Tests: new footing and dominance regressions; updated existing tests and golden snapshots.
- Docs: rule map, DESIGN, IMPLEMENTATION, BUGLOG, review handoff, test results, and [full balance report](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/docs/BALANCE.md>).
- Evaluation artifacts: `results/footing/`. Workflow unchanged.

Validation: **67 tests pass; 1 fails**—the requested S1 always-strike ≤50% regression. Typecheck passes. Evaluation completed **2,560 offline episodes**, 20 per cell. No commits, pushes, or model calls.

Full balance table below shows **wins/draws/losses**. D3 is expectimax; W3 uses weighted judgment; Alt alternates strike/bash.

| Situation/persona | D3 | D1 | W3 | Random | Strike | Bash | Guard | Alt |
|---|---|---|---|---|---|---|---|---|
| S1/Aggressor | 19/0/1 | 16/2/2 | 19/0/1 | 4/0/16 | 16/2/2 | 1/1/18 | 0/0/20 | 7/7/6 |
| S1/Sentinel | 20/0/0 | 20/0/0 | 20/0/0 | 13/3/4 | 16/1/3 | 20/0/0 | 0/2/18 | 19/1/0 |
| S1/Opportunist | 18/1/1 | 20/0/0 | 18/1/1 | 6/1/13 | 20/0/0 | 14/1/5 | 0/0/20 | 19/1/0 |
| S1/Adapter | 20/0/0 | 18/2/0 | 20/0/0 | 3/0/17 | 19/1/0 | 8/0/12 | 0/0/20 | 19/0/1 |
| S2/Aggressor | 10/4/6 | 9/5/6 | 10/4/6 | 2/1/17 | 7/7/6 | 0/0/20 | 0/0/20 | 4/1/15 |
| S2/Sentinel | 18/2/0 | 18/2/0 | 18/2/0 | 8/3/9 | 11/2/7 | 18/0/2 | 0/0/20 | 13/4/3 |
| S2/Opportunist | 15/3/2 | 11/5/4 | 15/3/2 | 1/0/19 | 17/2/1 | 9/0/11 | 0/0/20 | 16/1/3 |
| S2/Adapter | 10/4/6 | 17/1/2 | 10/4/6 | 1/2/17 | 19/0/1 | 4/1/15 | 0/0/20 | 16/0/4 |
| S3/Aggressor | 19/0/1 | 16/2/2 | 19/0/1 | 4/0/16 | 16/2/2 | 1/1/18 | 0/0/20 | 7/7/6 |
| S3/Sentinel | 20/0/0 | 20/0/0 | 20/0/0 | 13/3/4 | 16/1/3 | 20/0/0 | 0/2/18 | 19/1/0 |
| S3/Opportunist | 18/1/1 | 20/0/0 | 18/1/1 | 6/1/13 | 20/0/0 | 14/1/5 | 0/0/20 | 19/1/0 |
| S3/Adapter | 20/0/0 | 18/2/0 | 20/0/0 | 3/0/17 | 19/1/0 | 8/0/12 | 0/0/20 | 19/0/1 |
| X1/Aggressor | 19/0/1 | 16/2/2 | 19/0/1 | 4/0/16 | 16/2/2 | 1/1/18 | 0/0/20 | 7/7/6 |
| X1/Sentinel | 20/0/0 | 20/0/0 | 20/0/0 | 13/3/4 | 16/1/3 | 20/0/0 | 0/2/18 | 19/1/0 |
| X1/Opportunist | 18/1/1 | 20/0/0 | 18/1/1 | 6/1/13 | 20/0/0 | 14/1/5 | 0/0/20 | 19/1/0 |
| X1/Adapter | 20/0/0 | 18/2/0 | 20/0/0 | 3/0/17 | 19/1/0 | 8/0/12 | 0/0/20 | 19/0/1 |

[BUGLOG](</D:/Coding VS/game-dev-f26/midterms/nicoh-yay/docs/BUGLOG.md>) records the combat, testimony, prompt, snapshot, CLI, and dominance regressions. Independent review found no additional combat or information-boundary defects; the balance blocker remains.

**Nicoh’s decision:** proposed next experiment is STRIKE damage **3 → 2**, the smallest whole-point damage reduction. Always-strike’s 20/20 against Opportunist versus D3’s 18/20 supports testing it, but it is **unverified and unapplied**.