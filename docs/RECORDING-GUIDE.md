# Recording Tremor (3-5 minutes)

Working directory for every command: the Tremor project root (in the course repo,
`midterms/nicoh-yay/`). Run `npm ci`, then `npm run dev` (PowerShell: `npm.cmd`).
Open http://localhost:5191/ at 1920x1080 and keep browser zoom at 100%.
Use Windows Game Bar **Win+Alt+R** to start/stop capture of the browser window,
or OBS Window Capture with a 1920x1080 canvas. Record a short test first and check
that the game and the spectator text are readable. Narration is optional.

| Time | Shot and factual explanation |
| --- | --- |
| 0:00-0:30 | Title and How to play. Explain: reach the exit; Doom engine with original Tremor rules and licensed Freedoom data. Show the control summary. |
| 0:30-1:30 | Human play. Move, hold R to READ a human, hold TAB to see route guidance, show fear in the HUD. Explain that humans can be crew, human kills worsen aim, and bodies raise fear. Only demonstrate an effect if it actually occurs. |
| 1:30-3:00 | Open **Watch the agent**, select LIVE model recording - history, Start. Show the title card, actions, validity, calls, tokens and estimated cost. Explain: these are recorded LIVE model decisions executed again by the real browser engine, with no manual moves and no new model calls. The reason panel accurately says reasons were not retained in the original traces; do not supply invented model reasoning. Use 2x if desired, and disclose it. The full model recording takes about five minutes at 1x; it need not all appear in this shot. Capture the verified ending separately if needed and label any cut. |
| 3:00-4:00 | Select Live scripted baseline - careful, level E1M1, seed 17, Start. Let it play with no input. Then show the actual results table in [EVALUATION.md](../EVALUATION.md). Distinguish the current live baseline from the separately available recorded aggressive baseline success. Do not imply that one success establishes general reliability. |
| 4:00-4:30 | Limits and honest failure. Both supplied E1M1 model recordings ended by timeout, with health remaining, rather than reaching the exit. State this accurately; a wall-clock deadline includes model latency while simulated time advances only on actions. Mention small trial counts, held-out cases, and route-guidance asymmetry as documented in EVALUATION.md. Show a replay-verified ending if captured. |

The watch view accepts no keyboard or mouse movement commands. Pause/Resume,
speed, and setup controls only affect presentation or select a new episode.
The model clock sums recorded call latency and omits runner overhead; the five
minute cap is the evaluator's wall-clock cap. Simulation time is shown separately.
At 2x, actions remain seven tics each; only presentation timing changes.

Replay verification compares terminal status/reason/score and every metric,
including final health and tic, against the committed evaluation report. Original
JSONL traces contain per-call records, not terminal records; the served manifest
preserves the matching report's terminal record and provenance. A warning means
the replay did not verify: do not call it verified. Estimated costs use the dated
rates recorded for that evaluation and may be lower bounds for unknown usage.

Upload the recording to a **CourseWorks-viewable link**, for example Columbia
Google Drive with Columbia-only viewer access, or unlisted YouTube. Confirm that
instructors, TAs and peer reviewers can open it. Paste the final URL into the
recording entry in [README.md](../README.md) and the submission PR description.
Also link [AGENTS.md](../AGENTS.md) and the [Codex session index](agent-sessions/README.md)
from that PR. The student writes AGENT-TEAM.md in their own voice.
