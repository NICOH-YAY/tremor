# Review response - 2026-10-31

Session: Codex session codex-doom 12. Sole editor; no commits. Independent reviewer
file is untouched. All three scratchpad audits and human playtest read in full.
Current implementation/docs replace historical prototype claims. No live trial,
clean committed result, target-Brave measurement or human testimony is invented.

## Independent review mapping

| Finding | Disposition and file/evidence |
|---|---|
| M1 baseline regression | Fixed on E1M1 tuning only: bounded close READ, health>=90 reading threshold, close combat; src/agent/baselines.ts; tests/baseline.test.ts both 17/83 normal exits. Other maps may still fail; full report retains them. |
| M2 purge oracle | Fixed: full 35tics consumes 1,+3rounds,same message/radio/revealed crew for either identity; only evaluator saved differs. tremor.c TR_PlayerThink. Full unstunned unread fixtures, STUN then six PURGEs, no 1000tic shortcut; tests/agent.test.ts. Test failed before fix at tic 42. |
| M3 corpse/drop leak | Fixed: +1seen/+2fresh-close all humans; same 31/256 drops, human-death radio neutral. tests.c twin corpses at 0/24/49/79/99, once-only over 1000ticks and matched full-byte drop trials. |
| M4 contradictory docs | Rewritten current README, CONTRACTS, DECISIONS, DESIGN, rule map.40actions,257x257/16map,600caps, public terror bucket and numeric rounds/charges. Historical declaration under History only. |
| M5 CI C tests / paths | tests.c linked/exported in committed doom-test artifact, called from agent.test.ts and engine:test without emsdk. compiler.py uses EMSDK/EMSDK_PYTHON or PATH, no local paths. Manifest includes LF C snapshot as well as binaries. |
| m1 8-bit seeds | Documented modulo 256; seed 17=273 and 17!=83 multi-level 100step replay test. |
| m2 cosmetic RNG | M_Random gore; isolate P_SpawnMobj lastlook RNG around cosmetic spawns, mark extra pools seen so cosmetic gore cannot add fear; tests.c next-gameplay-roll parity. |
| m3 heal reduces bonus health | Fixed TR_Kill heals only below 100, leaves 150 unchanged; tests.c. |
| m4 corpse scan | Cursor walks thinkers without restarting at head;64visits/8LOS cap, angle once, removal hook prevents stale cursor; TR_CorpseRemoved in p_mobj.c. |
| m5 secret/privileged route | ML_SECRET barriers even for locked lines; sector planner excludes secrets. Docs explicitly call full-geometry cue a designed shared guidance aid, not nonprivileged navigation. |
| m6 hostile count budget | Retained as explicitly disclosed rule: hostile count+1, as requested in rules brief. README/help/contracts acknowledge exact count disclosure; no claim that this HUD resource hides the count. Changing it would change the supplied ammo design. |
| m7 activation map | Documented intentional human/agent D/S/T parity beyond texture-only view; mapped/drawable lines, secret activation suppression. |
| m8 stale events | Cleared at each step start in agent_api.c; radio transcript remains persistent. |
| m9 runner/report nits | Errors sanitized, invalid streak survives errors, generic controllers labelled controller; date+runId outputs; configId/source/artifact hashes and dirty state computed; safe.directory scoped git read. No state handle provided; not a security sandbox. |
| m10 pitch mismatch | P_AimLineAttack uses shot pitch when pitch/autoaim-off; READ/STUN/PURGE use same tracer. Actual pitch clamp +/-32degrees (command clamp 64). |
| m11 legacy/inflated tests | Retired src/sim,levels,render,audio,main,legacy interface and corresponding tests moved under legacy/. Vitest includes active tests only, typecheck excludes legacy. Longer replay/cross-seed coverage added. |
| m12 load objective | G_DoLoadGame invalidates objective/route/transient channels; next live tic replans immediately, no 35tic stale interval. |

## Audit-rubric mapping

| Item | Disposition |
|---|---|
| B2 committed clean evidence | NOT DONE: commits explicitly forbidden. Run records exact HEAD, dirty state, controller/config/artifact hashes. Claude must commit then rerun frozen command for clean evidence. |
| B5 AGENTS ownership | DONE: GPL provenance, C ownership, append-only ABI, sole editor, commands, public controller boundary. |
| M1 README / legacy | DONE: current scope/exclusions/freelook/rules/controls/40actions/600caps; legacy excluded, no local paths. |
| M2 docs current state | DONE: DESIGN/DECISIONS/CONTRACTS/map rewritten; plan active declaration/amendment table with superseded material only under History. |
| M3 source labels/numbers | DONE: legend code/manual/observed/assumed/design, constant rows,40macro table, inherited source symbols. Manual is project player manual; code sources identify inherited mechanics. |
| M4 declaration | DONE: E1M4/E1M5 seen; E1M6/E1M7 frozen 2026-10-31 before model trials and before expanded baseline run. No subsequent controller/prompt tuning on them. |
| M5 progress | DONE with declared proxy limits: final health,kills,crew,reads,fired_unread,terror; sector-hop route progress and distinct key types plus completed exit, not a universal traversability proof. |
| M6 traces | DONE: representative gzip traces/hashes in eval/traces-sample; model trace remains pending, never mocked as live. |
| M7 CI invariants | DONE: shipped tests.c coverage through Vitest/engine:test. |
| m2 legal player | DONE: legal_actions rejects unknown player/state like observe. |
| m3 prompt | DONE: every observation field explained, spacing repaired, parity/purge/terror/radio/route/HUD semantics. |
| m4 seed note | DONE:8-bit RNG-start statement in README/plan/report. |
| Upstream screenshots | Preserved. Only marked engine patches; no upstream screenshots deleted. |
| Submission copy | Scratch game-dev-f26/midterms/nicoh-yay copy command verification recorded below; actual course checkout not edited. |
| Skill | Two real tremor-level-check invocations logged with requested session label; this is one session, not invented separate sessions. |

## Audit-sources mapping

| Item | Disposition |
|---|---|
|1 root license/content terms | DONE: GPL LICENSE; README separates creative art/radio, generated ownership limits. |
|2 Freedoom contributors | DONE: v0.13.0 CREDITS link in FREEDOOM-LICENSE.txt. |
|3 derivative notice | DONE: README/title/art credits identify modified Freedoom sprites, contributor copyright/BSD. |
|4 Higgsfield | DONE: all filenames,z_image,date,official terms 4.4 URL/official confirmation; external postprocess script explicitly external. |
|5 third-party table | DONE: doomgeneric/Freedoom/OPL/Emscripten/npm versions/licenses/URLs/shipped status. |
|7 affiliation | DONE: Phobos/UAC descriptive; no id/ZeniMax affiliation. |
|8 legacy levels | DONE: moved/excluded. |
| Rule map / encoding | DONE in editable owned text; reviewer file preserved exactly per instruction, upstream/vendor notices preserved. Unknown-map '?' and actual JS '?' operators remain intentional. |

## Audit-clarity and playtest mapping

| Item | Disposition |
|---|---|
| Title/intro/help/README rules | DONE: concise title How to play plus expandable exact rules, intro goal,? help pauses via uiPaused/settingsOpen, README Rules near top. |
| HUD onboarding | DONE: persistent localStorage once-only hints for first visible unread human,human kill,shaken fear,zero rounds; separate from Halloran. Q held shows charges. |
| Intermission moral-score contradiction | DONE: inherited kill% explicitly bookkeeping, no invented moral aggregate. |
| WAD/audio leak | DONE: structural header/directory/lump/required-content validation and mod download before audio; repeated invalid-load DOM regression allocates zero contexts. Later failed startup closes context; instantiated engine failures require reload. |
|1 route BFS | PARTIAL: static sector/wall/lock raster caches; keys refresh locks; dynamic heights; requested agent/TAB refresh 7tics, hidden browser <=1Hz; observation pure. Search remains synchronous when requested, not spread across tics: changing it to a delayed incremental job was deferred to preserve the synchronous course step/observe contract and responsive shared cue. This requested implementation detail remains unfinished, despite measured cost reduction. |
|2 blit | DONE: pre-scale cap 3, ResizeObserver layout. |
|3 Asyncify | DONE: removed, callback pause/direct transitions; measured before/after below. |
|4 DOM writes | DONE: cache text/style values, update on change. |
|5 story scan | DONE: decoder cached,4Hz rather than per frame. |
|6 buffers | DONE: SFX AudioBuffers by lump/rate/length; mutter/impact/crackle pre-generated once during validated startup. |
|7 OPL | DONE: disconnect ScriptProcessor for horror style. |
|8 quest replan | DONE: sector/cards/height signature instead of O(S^2) each 35tics. |
|9 corpse scan | DONE: cursor/removal hook,64visits cap,8LOS,one angle. |
|10 preview | DONE: no suspended Asyncify stack; production preview smoke verifies paused tics. |
| Playtest 1 holdTAB | DONE in am_map.c keydown starts, repeat stays,keyup stops; route arrow HTML remains visible while held. |
| Playtest 2 take-control overlay | DONE: small corner hint, disappears after first keyboard/click; no centered crosshair obstruction. |
| Playtest 3 id strings | DONE: text-only Freedoom BEX replacements generated from licensed DEHACKED strings; original finale/quit override; intermission graphics come from Freedoom WAD. Dehacked gameplay patches intentionally not loaded. |
| Playtest 4 damage | DONE: fear 0 damage multiplier 1.0 C check; red edge flash uses attacker bearing (unattributed hits use rear edge). Visual/audible target-Brave verification NOT DONE: UI inventory returned apps=[],browsers=[]. |

## Verification and limitations

Final results, exact commands/counts and trace links: EVALUATION.md and
SKILL-INVOCATIONS.md. Live model rows pending; cannot make A-proof live-comparison,
clean-commit or human playthrough claims. Other-map baseline failures remain.
Two invocations in this one session satisfy the user's requested logged count;
they do not establish two distinct sessions if the course requires that literally.

Performance evidence: engine/build/session-before-browser.json,
session-after-browser.json,session-after-headless.json. Stationary E1M1 software
render mean 0.229680ms ->0.193101ms; p95 0.337600 ->0.274600ms.200headless wait+extra
observe calls 1290.079 ->770.545ms. Excludes Canvas/DOM/audio; not CPU-only Brave
frame-budget proof. Direct transitions replace melt wipes. Full requested route
search remains synchronous; static caches remove repeated geometry work.

Final command evidence (2026-10-31): root npm ci,43/43 tests, typecheck,build,
508/508 C checks passed. Scratch `game-dev-f26/midterms/nicoh-yay/` npm ci and
the same checks passed. Full 28-case rerun: aggressive2 exits/10deaths/2step-limits;
careful2/10/2, zero illegal actions. EVALUATION.md links the final run and sample
trace manifest. Live model rows pending. No commits. Final secondary objectives
are distinct key types actually collected plus completed exit; switches excluded.
