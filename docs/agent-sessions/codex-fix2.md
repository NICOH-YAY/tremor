Rule change for midterms/nicoh-yay (Trial by Combat: The Broken Oath), approved by Nicoh (Creative Director) on 2026-10-24. You are the implementation agent. Follow the rule-change discipline: update docs/rule-source-map.md rows (label `design`, with rationale) and DESIGN.md/IMPLEMENTATION.md, write failing tests first, then change the engine. No commits/pushes/model calls. Stay inside midterms/nicoh-yay/ and the existing workflow file.

GOAL: always-strike must stop being near-optimal, and combat must have a genuine spatial mechanic so movement is dynamic (it will drive the 3D renderer's choreography).

1. PARRY: when GUARD meets STRIKE, the striker loses 1 extra stamina (on top of STRIKE's cost); clamp at 0.

2. FOOTING (new mechanic). The duel has a clash point on a lane 0..6, starting at 3. Position 0 = player 0's back wall, 6 = player 1's back wall. "Pushed toward X's wall" moves the clash point 1 step toward X's wall (clamped).
   - A STRIKE that deals damage pushes the clash point 1 toward the victim's wall.
   - BASH pushes 1 toward the target's wall whenever it is not beaten by STRIKE and not evaded (so a BASH into GUARD shoves the guard back AND deals its 2 damage).
   - CORNERED: a fighter whose wall is the current clash point. A BASH against a cornered fighter deals +1 damage (wall slam). A cornered fighter's RECOVER restores only 1 stamina instead of 2.
   - If both pushes happen in one exchange (trades), they cancel.

3. NEW ACTION SIDESTEP (5 actions total: STRIKE, GUARD, BASH, RECOVER, SIDESTEP). Cost 1 stamina. Evades STRIKE and BASH entirely (no damage, no push), then moves the clash point 1 toward the CENTER (3) — this is how you escape the corner. If it evaded a STRIKE, the striker is overextended and loses 1 extra stamina. Against GUARD, RECOVER or SIDESTEP it does nothing except spend the stamina (the stamina changes of the other action still apply). Legal only with stamina >= 1. Keep the rule that at 0 stamina only GUARD and RECOVER are legal.

4. TELLS: add a SIDESTEP row and keep tells informative but noisy. New TELL_TABLE (committed action -> P(raised_blade / braced_shield / shifting_feet)): STRIKE .6/.2/.2, BASH .45/.35/.2, GUARD .2/.6/.2, RECOVER .25/.25/.5, SIDESTEP .15/.15/.7. Publish it in DESIGN.md.

5. OBSERVE: add the clash point position and a `cornered` flag for each side (public: both knights can see where they stand). Keep the information boundary tests passing; add position to golden snapshots.

6. PERSONAS (stochastic, learnable habits; update definitions in docs): Aggressor (STRIKE/BASH when affordable, presses toward the wall), Sentinel (GUARD-heavy, parries; SIDESTEPs when cornered), Opportunist (BASH a guarder or a cornered foe; RECOVER when low), Adapter (held out; shifts preference after repeated punishment). Update baselines' expectimax model and leaf evaluation to include position/corner (value of not being cornered).

7. X1 EVIDENCE: make the held-out "conflicting" testimony genuinely different from S1 "ambiguous": e.g., S1 = two low-reliability witnesses both mildly accusing; X1 = one high-reliability exculpatory witness vs one high-reliability accusing witness. Document posteriors.

8. BALANCE CHECK (report, don't hand-tune silently): add simple bots always-strike, always-bash, always-guard, strike-bash alternator; run every baseline/bot vs each persona over the suite, 20 trials per cell. Success criteria: depth-3 expectimax beats every single-action bot and random in every situation; no single-action bot wins >50% in any situation. If unmet, list the smallest proposed numeric tweak (with evidence) for Nicoh instead of applying it.

9. Tests: payoff/resolution table for all 25 action pairs incl. pushes and stamina; corner rules; SIDESTEP legality; parry; position clamp; hidden-info test still holds; determinism/golden traces updated; a regression test for the always-strike dominance observation (assert always-strike no longer >50% win in S1 over fixed seeds).

Run npm test, npm run typecheck, the eval. Final message: changed files, test summary, full balance table, BUGLOG/regressions added, proposals needing Nicoh's decision.
