**Pick the bomber arena: “Courtyard Chaos.”** It offers readable danger, satisfying destruction, and immediate rematches while using the existing castle assets. Thirteen days is feasible **only if Nicoh enjoys the first playable build**. No class abilities, networking, campaign, or kick mechanic in v0.1.

Tron is the cheapest fallback, but instant elimination and limited interactions risk another rejected prototype. Pac-Man adds ghost behavior, maze tuning, and pursuit feel without using the four-character arena concept as naturally.

**1. Critique and reconstruction scope**

Claude’s proposal fits the rubric well; its biggest risks are sluggish controls, unfair-looking deaths, and spending days on an impressive evaluation harness before discovering the game feels bad.

Describe it as a **scoped Bomberman/Pommerman reconstruction with declared modifications**, not benchmark-compatible Pommerman. Standard Pommerman FFA is fully observable; its team variant supplies the partial-observation precedent. Its documentation and constants also differ on bomb lifetime, so pin a commit and resolve behavior against engine code before claiming fidelity. [Overview](https://github.com/MultiAgentLearning/playground/blob/master/pommerman/README.md), [constants](https://github.com/MultiAgentLearning/playground/blob/master/pommerman/constants.py).

The repository license is Apache-2.0. Preserve applicable attribution, license, modification notices, and any relevant NOTICE when adapting code. [License](https://github.com/MultiAgentLearning/playground/blob/master/LICENSE).

**2. Exact proposed v0.1**

All specifications below are **design decisions**, pending source mapping and review.

- **Loop:** clear crates, collect upgrades, trap opponents, escape chain explosions. One human versus three bots; four cosmetic characters with identical mechanics.
- **Arena:** 11×11 including solid border; interior pillars at even/even coordinates; four corner spawns. Place 32 seeded crates elsewhere, excluding each spawn and its two adjacent escape cells.
- **Timing:** 6 simulation ticks/second, smoothly interpolated rendering. One cardinal tile movement per tick. Target 60–120 seconds; hard cap 720 ticks/120 seconds. Early deaths are possible.
- **Controls:** WASD/arrows move; Space drops a bomb instead of moving that tick; R instantly rematches after elimination/result.
- **Bombs:** one active bomb initially; fuse 18 ticks after placement; center plus two tiles in each cardinal direction. Walls stop blasts; first crate is destroyed and stops that ray. Bombs chain immediately. Flames last three ticks and kill on contact, including the owner.
- **Blocking:** bombs block re-entry after leaving; players block movement. Conflicting destinations and swaps fail simultaneously. Resolve movement, placement, explosions, damage, then surviving-player pickups.
- **Upgrades:** 16 crates contain seeded pickups: eight capacity and eight range. Each adds one; caps three bombs/four-tile range. Reveal after flames expire; later blasts destroy exposed pickups. No kick.
- **Outcome:** last survivor wins; simultaneous final deaths or multiple survivors at timeout draw.

Fun comes from responsive movement, pulsing fuses, clear blast geometry, crunchy crate bursts, chain reactions, brief adjustable screen shake, optional sound, and immediate retry. Use a high camera so castle scenery never hides hazards.

**3. Agent cadence and observation**

Choose **bounded macros with lockstep evaluation**. Humans play continuously against local bots. Evaluation pauses between macro decisions; never market this as real-time LLM reflex play.

Agent vocabulary: `WAIT`, `MOVE_TO(visible tile)`, `BOMB_HERE`, `ESCAPE`. Each executes at most six primitive ticks. The deterministic controller handles pathfinding and visible imminent danger; bombing requires an observation-based escape route. Log every primitive action and override.

At 720 ticks, that is at most 120 calls per focal model episode, versus 720 per-tick calls. At the supplied 1–2-second latency, inference alone could take 2–4 minutes. Measure tokens and latency before setting the dollar budget.

Keep `reset/observe/legal_actions/step/outcome`; `step` advances one simultaneous primitive tick.

`observe()` exposes self position/ammo/range, tick, public survivors, and visible terrain, players, pickups, bombs’ remaining fuses/ranges, and flames. Partial mode reveals a radius-three square without wall occlusion; everything else is unknown. No seed, hidden drops, opponent plans, or private state. Legal-action responses must not reveal unseen occupancy.

**4. Baselines and experiments**

Use a seeded adaptation of [Pommerman SimpleAgent](https://github.com/MultiAgentLearning/playground/blob/master/pommerman/agents/simple_agent.py): danger avoidance, crate bombing, pickup seeking, enemy approach. Call it adapted, not an exact port. Compare its primitive policy separately; add a heuristic commander sharing the model’s controller for fair macro comparisons. Random and stand-still are floors.

Declare three situations: crate opening, chain-bomb escape, and open endgame. Run each model arm twice per situation; reserve unseen layouts/seeds, including a corridor endgame, for held-out evaluation.

Primary arms: observation-only versus last-eight-observation/action history, both partial-view. Full-view observation-only is a diagnostic. Hypothesis: history improves navigation around remembered hazards; controller assistance may reduce the effect. Report wins, survival, self-kills, invalid proposals, overrides, fallback rates, calls, tokens, and latency. Small samples support descriptive conclusions.

**5. Build order and checkpoint**

**First build pass:** browser-playable movement, bombs, crates, deaths, simple bots, restart, pixel renderer. Nicoh plays before experiments. Record actual feedback and voluntary rematches; fix feel immediately.

**Oct 26:** deploy playable slice, demonstrate chain explosions, capture Nicoh’s feedback, document reconstruction differences, and freeze scope with Nicoh’s decision.

Then interface/tests → credible bots → fog/macros → authorized live pilot → declared suite/held-out → polish, recording, evidence. Preserve X2’s existing final-only restriction. CI covers deterministic rules/replays, observation non-interference, rejected actions, types/build, and browser smoke. Follow test-first rule mapping and independent review; record actual agent contributions and human playtests only.

Higgsfield assets: title/key art, restrained UI frame, two upgrade icons, four portraits, victory screen.

**6. Repository**

Use `midterms/nicoh-yay/courtyard-chaos/`. Preserve Trial by Combat in committed history before removing its working files; preserve any uncommitted work first. Avoid an archive duplicating dependencies. Keep a parent README linking the old commit and new game. No changes made.