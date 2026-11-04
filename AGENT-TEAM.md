# Agent team log

Written by Nicoh. Claude Code and Codex only arranged these sentences under headings, fixed typos and added the evidence links. At my request Claude reworded two passages, the skill paragraph and the second limitations point in EVALUATION.md, to be accurate.

## What I built

I decided to build a scary FPS where each entity you kill and body you see will have a lasting impression in your psyche.

Evidence: [README.md](README.md), [docs/DESIGN.md](docs/DESIGN.md)

## Phase 1, the first prototype (Oct 30)

### Why parallel agents

I had several agents working in parallel to make the research efficient, to understand the rules, and source code to make sure it was feasible, have the harness build and merge branches and have reviews, etc. It was all to optimally build, and create at a fast pace while having an overarching thought partner that could respond to my decisions and delegate tasks to other agents.

Evidence: [docs/research/doom-rules.md](docs/research/doom-rules.md), [14860bd](https://github.com/NICOH-YAY/tremor/commit/14860bdd43d647addbd9b57e157b90eb062c8af1), [bd215b9](https://github.com/NICOH-YAY/tremor/commit/bd215b9ba36a068edd9af21979365124ecbc8ea5), [2df3d79](https://github.com/NICOH-YAY/tremor/commit/2df3d794b1ceb5e419530cde573739ff53516aa2), [d1f17f6](https://github.com/NICOH-YAY/tremor/commit/d1f17f62c0d6d0d01bdd85a465a1254d1c640214), [8aed0c7](https://github.com/NICOH-YAY/tremor/commit/8aed0c77141664bc001b4a3b1990014abbc5f594), [22b25f9](https://github.com/NICOH-YAY/tremor/commit/22b25f9b29e14b3526b4493f847380ef3e0d7a13), [645f597](https://github.com/NICOH-YAY/tremor/commit/645f5971a27a50698a09e685919ccb35cc139222), [2efcd5f](https://github.com/NICOH-YAY/tremor/commit/2efcd5fc9d98caef2abf632a487d408f7495e266)

### Why I rejected it

The first prototype I played alongside the first playtester... was literally too easy. It lacked any depth and felt so random it was like running and shooting so much guns it did not capture anything of what I intended so I realized I had to be more specific and clarify what I actually wanted. Also bugs like enemies shrank instead of dying, it was very clunky to play.

Evidence: [docs/README-ts-superseded.md](docs/README-ts-superseded.md), [legacy/](legacy/), [docs/playtests/README.md](docs/playtests/README.md), [docs/reviews/independent-review-2026-10-30.md](docs/reviews/independent-review-2026-10-30.md)

### What I did instead

In response to that I sort of worked with Claude and did a brain map of what I would like to see against what is available and worked with AI as a thought partner and eventually went into a 2 hour YouTube gaming rabbit hole until I realized that resources, alongside gore and a sort of trauma response would make the game feel substance as now each bullet has a pseudo moral weight and you as the player are trapped in this area with these creatures trying to escape.

Evidence: [docs/DECISIONS.md](docs/DECISIONS.md), [README.md](README.md), [4afe400](https://github.com/NICOH-YAY/tremor/commit/4afe400cedca1ce65abe18289a37600577413fc6), [27f662b](https://github.com/NICOH-YAY/tremor/commit/27f662bff5f16f494d982a217bc229effb5b9eac)

## Codex, the only code editor

I decided Codex to be the only one editing code per the agreement mentioned in the class with the free 100 in credits. There wasn't any particular time where Codex LACKED in any capacity but there was a few things that got lost in translation (such as me not describing or delegating specifically enough).

Evidence: [AGENTS.md](AGENTS.md), [docs/agent-sessions/README.md](docs/agent-sessions/README.md)

## Claude Code, planner, playtester and debugger

I used both Claude and Codex in parallel and when Codex was building I had Claude help as a thought partner to write instructions to clarify my descriptions and also be a playtester. I also had Claude help debug the game and mechanics to alert Codex.

I remember that in response to me wanting more clarification for the user on what to do when they spawn, i.e. a clear end goal, Claude suggested having a voice, and I was like sure that seems interesting. AND it was so robotic and creepy it added so much to the game's atmosphere I kept it immediately. But for some reason it was a little iffy toward having the gore mechanic function as I intended and instead didn't really have any gore (not like crazy gore). I just wanted to show blood and have sound effects to make the mechanic make sense. Eventually I was able to change and clarify the uses.

Evidence: [Radio instructions session](docs/agent-sessions/codex-doom6.md), [docs/DESIGN.md](docs/DESIGN.md), [docs/agent-sessions/codex-doom2-result.md](docs/agent-sessions/codex-doom2-result.md), [27f662b](https://github.com/NICOH-YAY/tremor/commit/27f662bff5f16f494d982a217bc229effb5b9eac), [d608349](https://github.com/NICOH-YAY/tremor/commit/d608349868110a05a394c330b146cca79dfc697b), [9bba987](https://github.com/NICOH-YAY/tremor/commit/9bba9876420796f0625e84d672791df4a887c01a)

## Independent reviewers and audits

I wanted reviewers that didn't write code (Oct 30, Oct 31st and Nov 2nd) to verify and test the game to find and help the main agents doing the work to save tokens and time. These reviewers also found areas that could add clarity and speed up the code.

To me what mattered the most was the purge leaking crew identity finding since that would've made the mechanic not work as intended.

Evidence: [docs/reviews/independent-review-2026-10-30.md](docs/reviews/independent-review-2026-10-30.md), [docs/reviews/independent-review-2026-10-31.md](docs/reviews/independent-review-2026-10-31.md), [docs/reviews/review-response-2026-10-31.md](docs/reviews/review-response-2026-10-31.md), [docs/reviews/review.md](docs/reviews/review.md), [docs/reviews/review-response.md](docs/reviews/review-response.md), [docs/reviews/review-final-2026-11-02.md](docs/reviews/review-final-2026-11-02.md), [docs/reviews/review-final-response.md](docs/reviews/review-final-response.md), [ac0e32b](https://github.com/NICOH-YAY/tremor/commit/ac0e32ba1d1f18da12937a970096e6227ff02c1e), [9927bfe](https://github.com/NICOH-YAY/tremor/commit/9927bfee94a74b39a0e20fe029905ca4f139a47f)

## Reusable skills

Because I was working a lot with agents in parallel I decided to make reusable skills so the agents wouldn't spend too much time on prompt engineering or tokens. One skill, tremor-level-check, lets the agents check a level the same way every time, and the other, tremor-submission-audit, audits the work before it gets submitted.

Evidence: [skills/tremor-level-check/SKILL.md](skills/tremor-level-check/SKILL.md), [skills/tremor-submission-audit/SKILL.md](skills/tremor-submission-audit/SKILL.md), [docs/SKILL-INVOCATIONS.md](docs/SKILL-INVOCATIONS.md)

## Other tools

### Higgsfield art and the terms check

The title art came from Higgsfield and before shipping it I wanted to have an agent review the legal terms to make sure I could have it. I think it should be independently checked outside of just myself since the reviewer might be able to capture nuances I wouldn't be able to find.

Evidence: [public/art/CREDITS.md](public/art/CREDITS.md)

### The Gemini player

The Gemini player only gets the info from the game screen since it's like a test. If we want to simulate how a player would behave it shouldn't be able to look at the map files or read the code since it would just cheat and the results wouldn't mean anything. Which is to say it would just look at the code on how to beat the game opposed to just experiencing the game.

Evidence: [docs/CONTRACTS.md](docs/CONTRACTS.md), [EVALUATION.md](EVALUATION.md)

## A decision I changed after it was implemented

Another decision that was made from the AI that I had to alter was when it first made the voice... although I liked the way it sounded it would constantly talk which altered the gaming experience. Since it made it very clear what needed to be done and it didn't leave the player on their own with an objective. The idea was to give a little bit of nudges and leave the person in the scenario so I had to revise it after it was first implemented.

Evidence: [27f662b](https://github.com/NICOH-YAY/tremor/commit/27f662bff5f16f494d982a217bc229effb5b9eac), [d608349](https://github.com/NICOH-YAY/tremor/commit/d608349868110a05a394c330b146cca79dfc697b)

## What I would do differently

If I had to do this again, I would probably systematize the mechanics. Which is to say I would have the core mechanics explained as precisely as possible. I had troubles expressing what I wanted when describing which led to some weird issues in delegation as some agents were also getting stuck since the scope they were operating under was ambiguous at times. I would describe the basic ideas of the mechanics first then have separate agents in parallel make smaller versions of that mechanic to save time and resources and then come together with an earlier playtest so it would be easier to change the mechanic since it would be easier to identify WHICH agent made an issue or something that I took issue with.

## Evidence index

- [Ownership and boundaries](AGENTS.md)
- [Agent sessions](docs/agent-sessions/README.md)
- [Reviews and responses](docs/reviews/)
- [Skill invocations](docs/SKILL-INVOCATIONS.md)
- [Playtest notes](docs/playtests/README.md)
- [Design decisions](docs/DECISIONS.md)
