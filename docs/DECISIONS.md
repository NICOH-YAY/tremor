# Current decisions - 2026-10-31

| Choice | Alternative beaten | Reason |
|---|---|---|
| Layered OPL + audible horror default | Score-only default | Player feedback reported missing music; midrange score supports laptop playback, original melody remains present and fear darkens it. Score-only remains selectable. |
| GPL engine + Freedoom | Separate agent TS game | Same human/evaluated mechanics; licensed data |
|40 constant macros | Contextual legality/continuous floats | Finite reproducibility, no legality oracle; append-only ABI |
|7 tics/0.2s | Per-tic model calls | Preserve 35Hz mechanics while bounding calls;5 actions/channel |
| Public aggressive/careful heuristics | Random baseline | Route/doors/pickups/combat; careful READ/PURGE when safe |
| Close READ while health>=90 | Distant stationary READ | E1M1/17 tuning trace died while reading; low-health careful may fire unread |
| K=8 history | Unbounded history | Predictable context/cost; observation-only ablation |
|3 tuning, 2 seen, 2 fresh held-out, 17/83 | Handpicked successful starts | E1M4/E1M5 seen; freeze E1M6/E1M7 before model trials |
| Corpse-attention fear | Elapsed-time fear | Looking/moving matter; once/body prevents farming |
| Shared rare ammo | Infinite ammo/zero resupply | Scarcity with mercy/exploration recovery; initial hostile total public |
| Shared geometry route cue | Straight arrow/agent-only path | Unseen geometry guidance intentionally public for both; secrets blocked |
| Exit 100 else 0; separate moral metrics | Weighted horror/morality score | Avoid ambiguous aggregate; inherited kill% remains bookkeeping |
| Clamped Y-shear freelook | True 3D renderer | Cheap software compatibility; aimed interactions follow shot pitch |
| Full crew/possessed purge parity | Silent crew no-op/free oracle | Completed 35 tics spends 1, +3 rounds, same radio/message, revealed crew; saved metric alone differs |
| Identical human corpse fear/drop | Hidden identity weights/crew no drops | Closes bucket/probabilistic identity channels |
| Heal only below 100 | Clamp every kill to 100 | Never reduce bonus health |
| Cosmetic M_Random gore | P_Random gore | Visual settings must not change gameplay stream |
| Per-step events | Undocumented rolling 5messages | Remove stale causality; transcript persistent |
| Synchronous pause/direct transitions | Whole-engine Asyncify | No suspended stack during preview; measure in response |
| Cache topology/demand route | Rebuild geometry every 7 tics | Responsive requested cue; less idle overhead |
|600 actions/calls | Conflicting 600/1800 | Keep latest survival declaration; C/runner/eval agree; plan preserves amendments |
| Shipped C-suite test WASM | Require emsdk in CI | Fresh clone executes invariant checks; production has no fixtures |
| Separate legacy/ | Count retired prototype tests | Current engine evidence is clear |

Seed is 8-bit: congruent modulo 256 identical;17/83 distinct. Handle isolation is
not a code-import sandbox. Failed calls preserve invalid streak, errors sanitized,
fallback labelled. Date+runId reports, computed configuration/source/artifact hashes
and actual dirty state replace stale literals. Codex cannot produce committed-clean
run evidence because commits are forbidden: Claude must commit then rerun frozen suite.
