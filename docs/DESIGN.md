# Current design - 2026-10-31

The gun works perfectly. The person holding it does not. Shared GPL engine and
licensed Episode 1 data keep human and agent mechanics identical. Exact rules:
[Rules](RULES.md), mirrored in README and title/help.

READ trades exposure for knowledge. Completed charge-costing PURGE deliberately
reveals both hidden identities identically. Crew never attack. Every human kill
adds trauma; heal tempts violence without hidden-identity reward differences.
All human corpses have equal terror and drop rules. Fear follows attention,
counts once/body, decays slowly and halves at entry. No moral aggregate score;
inherited kill% remains bookkeeping. Shared scarce ammo makes exploration/mercy
valuable; initial hostile count+1 is explicitly disclosed by the HUD budget.

Full-geometry route guidance intentionally reveals unseen dependencies equally
to human TAB and agents. Secret lines excluded. Weighted lattice/quest graph
remain imperfect for complex lifts/teleporters, not a universal path guarantee.

Native 320x200 at 4:3. Cached overlays/sound buffers, capped 3x pre-upscale, resize
layout reads, story decode 4Hz, layered OPL/horror music by default. Halloran: one briefing
per map plus rare episode-once beats.16KB transcript shared; onboarding uses HUD.
Tremor 3 saves persist episode/radio/corpse state, partial channels reset.

No Asyncify: callback returns while paused and excludes pause time. Intro gates
the callback by Promise; blocking melt wipes become direct-frame transitions.
Static lattice sector IDs/wall marks cache per level/cards; dynamic heights update.
Quest planning replans on sector/cards/geometry signature changes. Requested
agent/TAB cue remains responsive; browser cue with TAB closed recomputes at most every 35 advancing game tics. Observe is pure.

Limitations: true 3D pitch/640x400 absent; target Brave Canvas/audio profiling,
full human episode playthrough and live model comparisons require separate evidence.
Legacy TS is excluded and supplies no current design or test claims.

## Parameter rationale

These are design judgments, not fitted optima or claims of measured player
preference. Alternatives below explain the tradeoffs; they were considered as
design options, not experimentally validated balance sweeps.

| Parameter | Why this value; alternative considered |
|---|---|
| Crew 90/256 (35.16%) | Roughly one in three humans makes reading consequential while leaving most humans hostile. Half would make combat less common; one in ten would make indiscriminate shooting too attractive. Probability is the RNG threshold, not a measured per-map fraction. |
| READ 35 tics | One second requires sustained attention and five agent actions. Instant identification removes exposure; two seconds doubles stationary risk. |
| PURGE 35 tics; two charges | One second of close contact leaves a usable window after stun; two rescues force allocation. Instant rescue removes commitment; unlimited charges erase scarcity. |
| Stun 70 tics; cooldown 35 | Two seconds covers the one-second purge plus approach/aim slack. One second leaves no slack; a longer freeze makes contact too safe. One-second cooldown limits rapid repeats without a long lockout. |
| Terror weights +1; +2 fresh/close | Every corpse matters once; a fresh (<70 tics), close (<256 units) corpse has twice the impact. Identity never changes weight. Repeated per-frame scoring would punish looking rather than discovery. |
| Terror range 1024; close 256; +/-45 degrees | Nearby forward-visible corpses contribute, with close shocks at quarter range. Whole-map or rear exposure would disconnect fear from attention. |
| Terror cap 100; buckets 25/50/80 | Percentage scale simplifies interpolation; broad low/mid buckets and a narrow final breaking band communicate escalating risk without exact hidden HUD numbers. Equal quarters were considered; 80 reserves breaking for severe exposure. |
| Hit loss 179/256; floor 77/256 (~30%) | Severe fear strongly degrades fire while preserving a chance to escape. Zero success creates a soft lock; 50% makes the maximum fear penalty mild. |
| Damage extra 6/10 (+60% at 100) | Fear makes exposure dangerous without doubling every incoming hit. +100% compounds scarce ammo too sharply; no damage penalty leaves only shooting affected. |
| Decay 350 tics; level carry half | Ten seconds per point makes retreat useful but avoids instant emotional reset. Per-second decay trivializes exposure; no decay makes every mistake permanent. Halving gives partial relief at a level boundary. |
| Ammo keep 64/256 (25%) | Quarter-density pickups make route exploration valuable under a shared budget. Half retains too much inherited ammo; zero removes pickup decisions. |
| Death drop 31/256 (~12%) | Occasional single rounds relieve starvation without making kills a reliable ammo farm. Guaranteed drops undermine scarcity; no drops removes recovery chance. |
| Purge mercy +3 rounds | Repays a small engagement budget and supports the next encounter, identically for either identity. +1 is easily lost to a miss; a full box makes rescue an outsized ammo source. |
| Initial hostile count+1; pickups 2/4/backpack 8 | One round per hostile plus one spare creates a legible finite budget, explicitly disclosing an aggregate. Small integer pickups matter; inherited large packs would swamp it. Backpack retains four two-round grants. |
| Human/demon heal 15/10; cap 100 | A human kill tempts greater recovery but incurs trauma. Equal heals weaken that temptation; healing above normal max rewards farming. Existing overheal is preserved. |
| Trauma +1 cap 6; aim unit 16384 | Six irreversible increments make several human kills matter but bound permanent dispersion. Unbounded trauma risks an unwinnable late game; no cap would amplify that risk. Aim unit scales binary-angle noise into noticeable per-kill dispersion. |
| Fist multiplier 10 | Inherited berserk-strength melee gives an ammo-free escape option. Ordinary fists are too slow against scarce ammunition; automatic kills remove positioning. |
| Cower 35 tics; demon/gun range 192/512 | One second makes crew reactions visible without immobilizing them indefinitely. Gunfire travels farther than nearby visual threat; equal ranges would obscure that distinction. |
| Radio cooldown 3150 tics (90 s) | Rare lines leave room for combat audio and avoid repeated exposition in a two-minute 600-action episode. Ten seconds is intrusive; episode silence loses narrative feedback. |
| Route 16-unit lattice; 256-unit waypoint; 128/512 bands | Matches map resolution, gives a short local steering cue, and distinguishes interaction range from room-scale navigation. A direct distant bearing misses corners; a full path exposes more structure. |
| Pitch +/-32 degrees | Supports vertical targets without claiming true 3D camera pitch. Wider shear distorts the classic renderer. |

Render tuning (gib threshold 192/256, range 128, blood 8..16, impact/kick/flash
6/3/8 tics) is cosmetic: frequent close gore and brief distinct feedback, with
bounded particles/durations rather than unbounded bursts. It does not affect
identity rewards. Corpse scanning's 64 visits/8 LOS tests is a bounded CPU budget,
not a fear multiplier. Native 320x200, <=3x pre-upscale and 4Hz story decoding
retain the classic image while limiting browser work; no visibility throttle is
implemented. Story polling continues every 250 ms regardless of tab visibility.

Known out-of-suite limits: chaingunners count as human but never spawn as crew;
Episode 1 suite maps contain none. For route lattices over ROUTE_MAX (1,048,576
cells), the early return can retain the previous cue. This is not reached in the
suite; extending supported data requires fixing both cases.

Music: Layered (default), Horror score, Original. One compressed music bus feeds master; the music slider scales both layers once (engine music volume stays full). Pads cover 120?900 Hz plus sub, with a 1.2?2 kHz slowly modulated lowpass. The calm score targets roughly -24 dBFS RMS at music 70 before master; this is a design target, not a listening measurement. Reused pulse/bell/metal oscillators avoid per-note buffers. Fear above .3 builds tension; fear above .9 permits 0.7?1.2 second dips at least 45 seconds apart. Layered OPL sweeps 18 kHz to 2.5 kHz, falls up to 45 cents and ducks up to 22%. Fixed-buffer interpolation in the existing OPL callback preserves streaming phase. Settings version 2 migrates unversioned horror to layered once; legacy data cannot distinguish a deliberate horror choice from the former default. Original and all versioned choices survive.
