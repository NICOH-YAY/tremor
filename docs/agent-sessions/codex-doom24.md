# codex-doom24: assemble the student-written submission docs (AGENT-TEAM.md, limitations, playtests), second skill, evidence index

Repo: the Tremor repository root (current HEAD d803595). You edit files only. Do NOT commit or push. Claude commits.

## Absolute rule for this session: the student's words are fixed

Every block below marked STUDENT TEXT is written by the student, Nicoh. Paste it VERBATIM. You may only
- split it into paragraphs at sentence boundaries,
- put it under headings,
- add evidence links AFTER a paragraph on their own line, in the form `Evidence: [file](path), [commit](url)`.
Do not reword, shorten, merge, "improve", or add sentences to student text. Do not add any first-person sentence of your own anywhere in AGENT-TEAM.md, the Limitations section or the playtest notes. Typos have already been fixed by Claude.
Any text YOU write (headings, evidence lines, the factual evidence index, the skill file) follows these style rules: no colons in prose sentences, no em dashes, no figurative language, no "not X but Y" / "instead of" / "rather than" constructions. (Colons inside markdown links, tables, code and file paths are fine.)

## Task 1. Create AGENT-TEAM.md at the repo root

Structure (headings are yours, text is his):

```
# Agent team log

Written by Nicoh. Claude Code and Codex only arranged these sentences under headings, fixed typos and added the evidence links. At my request Claude reworded two passages, the skill paragraph and the second limitations point in EVALUATION.md, to be accurate.

## What I built
## Phase 1, the first prototype (Oct 30)
### Why parallel agents
### Why I rejected it
### What I did instead
## Codex, the only code editor
## Claude Code, planner, playtester and debugger
## Independent reviewers and audits
## Reusable skills
## Other tools
### Higgsfield art and the terms check
### The Gemini player
## A decision I changed after it was implemented
## What I would do differently
```

Then a short final section `## Evidence index` written by you, factual, a bulleted list linking AGENTS.md, docs/agent-sessions/README.md, docs/reviews/, docs/SKILL-INVOCATIONS.md, docs/playtests/README.md, docs/DECISIONS.md.

Evidence lines to attach (verify each path/commit exists before linking; drop any that don't):
- What I built: README.md, docs/DESIGN.md
- Why parallel agents: docs/research/doom-rules.md, commits 14860bd (renderer worker), bd215b9 (mechanics worker), 2df3d79 (content worker), merges d1f17f6 8aed0c7 22b25f9, 645f597 + 2efcd5f (Codex agent harness and merge)
- Why I rejected it: docs/README-ts-superseded.md, legacy/, docs/playtests/README.md (playtest 1), docs/reviews/independent-review-2026-10-30.md
- What I did instead: docs/DECISIONS.md, README.md scope change section, commit 4afe400 (doomgeneric import), 27f662b (horror pass)
- Codex: AGENTS.md, docs/agent-sessions/README.md
- Claude Code: commit 27f662b (radio briefings first added), the later commit/session that limited the radio to one briefing per level (find it in git log / docs/agent-sessions; link it), the session that added blood/gore (find it), docs/DESIGN.md
- Reviewers: docs/reviews/ (list each review + response), the purge finding in docs/reviews/independent-review-2026-10-30.md, fix commit 9927bfe
- Skills: skills/tremor-level-check/SKILL.md, skills/tremor-submission-audit/SKILL.md, docs/SKILL-INVOCATIONS.md
- Higgsfield: public/art/CREDITS.md
- Gemini player: docs/CONTRACTS.md (observation), EVALUATION.md
- Decision changed: same radio commits as above
Use full GitHub URLs for commits: https://github.com/NICOH-YAY/tremor/commit/<hash>

### STUDENT TEXT, What I built
I decided to build a scary FPS where each entity you kill and body you see will have a lasting impression in your psyche.

### STUDENT TEXT, Why parallel agents
I had several agents working in parallel to make the research efficient, to understand the rules, and source code to make sure it was feasible, have the harness build and merge branches and have reviews, etc. It was all to optimally build, and create at a fast pace while having an overarching thought partner that could respond to my decisions and delegate tasks to other agents.

### STUDENT TEXT, Why I rejected it
The first prototype I played alongside the first playtester... was literally too easy. It lacked any depth and felt so random it was like running and shooting so much guns it did not capture anything of what I intended so I realized I had to be more specific and clarify what I actually wanted. Also bugs like enemies shrank instead of dying, it was very clunky to play.

### STUDENT TEXT, What I did instead
In response to that I sort of worked with Claude and did a brain map of what I would like to see against what is available and worked with AI as a thought partner and eventually went into a 2 hour YouTube gaming rabbit hole until I realized that resources, alongside gore and a sort of trauma response would make the game feel substance as now each bullet has a pseudo moral weight and you as the player are trapped in this area with these creatures trying to escape.

### STUDENT TEXT, Codex
I decided Codex to be the only one editing code per the agreement mentioned in the class with the free 100 in credits. There wasn't any particular time where Codex LACKED in any capacity but there was a few things that got lost in translation (such as me not describing or delegating specifically enough).

### STUDENT TEXT, Claude Code
I used both Claude and Codex in parallel and when Codex was building I had Claude help as a thought partner to write instructions to clarify my descriptions and also be a playtester. I also had Claude help debug the game and mechanics to alert Codex.

I remember that in response to me wanting more clarification for the user on what to do when they spawn, i.e. a clear end goal, Claude suggested having a voice, and I was like sure that seems interesting. AND it was so robotic and creepy it added so much to the game's atmosphere I kept it immediately. But for some reason it was a little iffy toward having the gore mechanic function as I intended and instead didn't really have any gore (not like crazy gore). I just wanted to show blood and have sound effects to make the mechanic make sense. Eventually I was able to change and clarify the uses.

### STUDENT TEXT, Reviewers
I wanted reviewers that didn't write code (Oct 30, Oct 31st and Nov 2nd) to verify and test the game to find and help the main agents doing the work to save tokens and time. These reviewers also found areas that could add clarity and speed up the code.

To me what mattered the most was the purge leaking crew identity finding since that would've made the mechanic not work as intended.

### STUDENT TEXT, Skills
Because I was working a lot with agents in parallel I decided to make reusable skills so the agents wouldn't spend too much time on prompt engineering or tokens. One skill, tremor-level-check, lets the agents check a level the same way every time, and the other, tremor-submission-audit, audits the work before it gets submitted.

### STUDENT TEXT, Higgsfield
The title art came from Higgsfield and before shipping it I wanted to have an agent review the legal terms to make sure I could have it. I think it should be independently checked outside of just myself since the reviewer might be able to capture nuances I wouldn't be able to find.

### STUDENT TEXT, Gemini player
The Gemini player only gets the info from the game screen since it's like a test. If we want to simulate how a player would behave it shouldn't be able to look at the map files or read the code since it would just cheat and the results wouldn't mean anything. Which is to say it would just look at the code on how to beat the game opposed to just experiencing the game.

### STUDENT TEXT, Decision changed
Another decision that was made from the AI that I had to alter was when it first made the voice... although I liked the way it sounded it would constantly talk which altered the gaming experience. Since it made it very clear what needed to be done and it didn't leave the player on their own with an objective. The idea was to give a little bit of nudges and leave the person in the scenario so I had to revise it after it was first implemented.

### STUDENT TEXT, What I would do differently
If I had to do this again, I would probably systematize the mechanics. Which is to say I would have the core mechanics explained as precisely as possible. I had troubles expressing what I wanted when describing which led to some weird issues in delegation as some agents were also getting stuck since the scope they were operating under was ambiguous at times. I would describe the basic ideas of the mechanics first then have separate agents in parallel make smaller versions of that mechanic to save time and resources and then come together with an earlier playtest so it would be easier to change the mechanic since it would be easier to identify WHICH agent made an issue or something that I took issue with.

## Task 2. EVALUATION.md limitations

Replace the `TODO: Nicoh to write...` line under `## Limitations (in Nicoh's words)` with the four STUDENT TEXT paragraphs below (in order L1, L2, L3, L4, as plain paragraphs, no sub-headings needed). Keep the `### Facts for the limitations paragraph` subsection but remove the now-stale sentences about peer notes status / "If partner notes have not arrived by Nov 6"; replace them with one factual sentence: the instructor's Nov 4 2026 update allows human playtest notes from anyone (classmate, friend or family), and the notes are in docs/playtests/README.md.

### STUDENT TEXT, L1
None of my agents were able to finish a lot of levels. Scripted bots were able to exit 2/14 runs and the Gemini player exited 0. This is because the Doom levels themselves have doors, keys and dead ends and with the fear mechanic (that makes them miss a shot on purpose when really scared) I watched the bot basically get bum rushed by enemies and miss everything (which was pretty entertaining), but it's a pretty hard game.

### STUDENT TEXT, L2
Each of the tests I ran were only run twice, so the number of tests is relatively small and I can't make any statistical claims from them. The seed also only changes the random start, so two runs of the same level are pretty similar. But I think it's still enough to check the basics of how the game works and that the mechanic behaves the way I designed it, which was my main goal. The human playtests (me and friends I showed the game to) showed the mechanics worked, even if they weren't always clear, since players didn't notice the ammo limit until they ran out and guessed at what the fear effect was.

### STUDENT TEXT, L3
The game is hard, my last playtester said that too. Especially on a laptop since I watched them on their little Mac trackpad trying to shoot the thing which was slow and clunky and they ended up dying a lot. It's a lot easier when there is a separate mouse to play and I can get through each level pretty quickly myself (but when I tried on their Mac I died so fast). I left it that hard because I think the core idea of what I was getting at was DONE successfully. The longer you take the more bodies you see/people you kill the harder the game gets naturally as the more scared you get and the more likely you are to miss a shot. That plus the music adds to a very cool atmosphere that feels rewarding when you finally beat the level.

If I had more time though, I would probably change the rates of ammo and make fear come in slower. Perhaps only after seeing a bunch of bodies. OR maybe interestingly you start off scared but once you kill a bunch of monsters you get more confidence and like less fear which is an interesting idea to explore.

### STUDENT TEXT, L4
The first thing I would fix is the spawns of some enemies. There's an enemy that spawns on top of the box which you can only kill if you have a gun so if you ran out of bullets you basically enter a room of you getting shot at and you can't do anything. But I tested with guns and it's possible to kill the enemy. I left it in originally since I thought it would incentivize after a couple runs of a player to be even more thoughtful with their bullets.

## Task 3. docs/playtests/README.md, human playtest notes

Keep the existing assistant browser playtest section (it is labeled as not human). Add or replace the human section with `## Human playtests (anonymous)`. Start with a factual line written by you: four sessions, players were friends and teammates, names withheld, the student watched; per the instructor's Nov 4 2026 update any human player counts. Then a short factual "Build played" line for each session, determined from git (verify the times):
- Playtest 1, Oct 30 2026, the retired TypeScript prototype (before 4afe400).
- Playtest 2, Oct 30 2026, the first real-Doom build after 4afe400 and before the horror pass 27f662b (no radio voice, no terror yet).
- Playtest 3, Nov 1 2026, and Playtest 4, Nov 2 2026, builds after the radio voice and terror (name the nearest commit on main before each date by author time; if ambiguous say "the build live on that date").
Then, for each playtest, three sub-labels `What the player did`, `Where they hesitated or guessed`, `What I changed or would change`, filled ONLY from the STUDENT TEXT below (you may split his paragraphs across the labels at sentence boundaries; do not add sentences; if a label has no student sentence, write "No notes recorded.").

### STUDENT TEXT, Playtest 1 (prototype, Oct 30)
They said that the game felt too short and easy, since all they did was go and kill people and there wasn't really an effect. They were confused on what to do when there wasn't any direction so I told them basically the end goal to escape after finding the keys to the rooms. This was the only session where I helped. After that I asked to follow the actual Doom game and add my earlier ideas like the fear.

### STUDENT TEXT, Playtest 2 (first Doom build, Oct 30)
They were confused as to what to do. They sort of just wandered around the area and got hit, and said the game felt more mysterious if anything but it was still confusing. I watched without helping. In response I added the moral aspect, a limited bullet count and Tremor, then added the speech at the beginning so there is a clear end goal for the player.

### STUDENT TEXT, Playtests 3 and 4 (after the radio voice, Nov 1 and Nov 2)
I watched without helping. Feedback was the game feels scary, which I thought was appropriate since it was a sub-thing I was trying to go for anyways. But they said it's too hard.

I noticed that they both stopped moving at the start when the voice came on and had a reaction. Then later when the voice talked again they were kind of "spooked" but with the music that sort of sounds like heartbeats they were like running and just killing things. But after clearing a room when the graphics were sort of bad they were both looking around and pressing buttons on the wall to see if it opened. When they saw the vision get a bit more blurry they sort of attributed the "fear" effect to being drunk in GTA and guessed that was the mechanic. The ammo count they didn't realize was limited until they ran out of bullets and had to fight with their fists.

The last playtester was on a Mac trackpad, which was slow and clunky, and they ended up dying a lot. I left the difficulty as it is and wrote what I would change in the limitations section of EVALUATION.md.

For playtests 3 and 4 use one combined block with the date line "Nov 1 and Nov 2 2026". Under "What I changed or would change" for it, use the last paragraph plus a link to EVALUATION.md#limitations-in-nicohs-words.

## Task 4. docs/peer-notes/README.md

Update to the current situation, factual, your words: no peer partners were assigned in class; the instructor's Nov 4 2026 update opened the human playtest requirement to anyone; the human playtest notes are in docs/playtests/README.md. Keep the "Given" section for notes the student will write on classmates' recordings (due by Nov 16), as a template. Remove any line telling the student to explain missing partners in the limitations. Also grep the whole repo (README.md, EVALUATION.md, docs/RUBRIC-CHECKLIST.md, docs/*.md) for stale "partner"/"peer notes pending"/"Nov 6"/"AGENT-TEAM.md pending/student writes" wording and make it current. README "Submission artifacts" must link AGENT-TEAM.md as present.

## Task 5. Second skill, skills/tremor-submission-audit/SKILL.md

Create it in the same format as skills/tremor-level-check/SKILL.md (read it first and mirror the frontmatter/structure). Build its checklist from the four audits Claude ran on Nov 2 (read-only inputs, in the old scratchpad added via --add-dir):
`<scratchpad>`, `audit-sources.md`, `audit-clarity.md`, `audit-brief.md`, plus `midterm-brief.md` in the same folder for the official requirements. The skill's job: a read-only audit of the submission folder against the midterm brief (required files present and linked from README, every rule cited to source, rules clear and visible in game, evaluation declared suite + limits + cost, reviews with response files, playtest notes with the three required parts and anonymity, licenses/credits, no personal data or secrets, CI commands) that writes a findings file and fixes nothing itself.

Then INVOKE it by name in this session: say in your result "Invoking skill tremor-submission-audit", follow it against the current tree AFTER tasks 1-4, and write the findings to docs/reviews/submission-audit-2026-11-04.md. If a finding is a pure documentation fix (broken link, stale wording, missing link) fix it and mark it fixed in that file. Do not change game code or student text for any finding; list those as open for Claude. Log the invocation in docs/SKILL-INVOCATIONS.md (session codex-doom24, date 2026-11-04, what was audited, link to the findings file), consistent with how tremor-level-check invocations are logged.

## Task 6. docs/agent-sessions/README.md evidence index

1. Make sure every Codex session from codex-doom17 through codex-doom23 and this one (codex-doom24) has a row; if any are missing, copy prompt and result from the scratchpads into docs/agent-sessions/ with the same redaction rules (replace absolute temp paths with `<scratchpad>`, scan for secrets). New-scratchpad files: `<scratchpad>` + `r23.md`. Old scratchpad has codex-doom17..22 and their results. For codex-doom24 add the row with result "this session" and commit "to be associated by Claude".
2. Add a second table `## Other agents (not Codex)` with factual rows: date, agent type/model, role, what it produced, evidence link. Rows:
   - 2026-10-30, Claude Sonnet research subagent, read Doom rules/source, docs/research/doom-rules.md
   - 2026-10-30, three Claude Sonnet worker subagents in parallel (renderer, mechanics, content) on the TypeScript prototype, commits 14860bd, bd215b9, 2df3d79, merged d1f17f6, 8aed0c7, 22b25f9
   - 2026-10-30, independent read-only reviewer, docs/reviews/independent-review-2026-10-30.md
   - 2026-10-31, independent read-only reviewer (twice), docs/reviews/independent-review-2026-10-31.md and docs/reviews/review.md (verify which is which from the files)
   - 2026-11-02, four read-only audit agents (rubric, sources and rule map, clarity and speed, full brief), now captured as the tremor-submission-audit skill; link the skill
   - 2026-11-02, independent read-only final reviewer, docs/reviews/review-final-2026-11-02.md
   - 2026-11-03, Claude Haiku subagent, independent check of Higgsfield terms, public/art/CREDITS.md
   - Gemini 3.5 Flash-Lite on Vertex, the game-playing agent under evaluation (not a builder), EVALUATION.md
   - Claude Code (Opus), planner, prompt writer, committer, browser playtester, evaluation runner, AGENTS.md
   Verify each file exists; adjust names to what is actually in the repo.

## Verification (required)

Run `npm test`, `npm run typecheck`, `npm run build`, `npm run engine:test` (or whatever the repo's engine check script is) and report counts. Run a check that every relative markdown link in AGENT-TEAM.md, EVALUATION.md, README.md, docs/playtests/README.md, docs/peer-notes/README.md, docs/agent-sessions/README.md, docs/SKILL-INVOCATIONS.md resolves to an existing file. Run a diff check that each STUDENT TEXT block above appears verbatim (modulo paragraph splits) in the output files, and report the result. Grep new/changed files for personal names, emails, UNIs, absolute local paths (<scratchpad>) and secrets; there must be none (the scratchpad paths may appear only as `<scratchpad>`). Make sure every changed text file is LF (the repo has eol=lf and CRLF has broken CI before).

Final answer: a short list of files changed, the verbatim-check result, the audit findings summary (fixed vs open), and test counts. No commit.
