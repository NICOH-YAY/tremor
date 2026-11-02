# Served recording evidence

The three gzip files are byte-identical copies of the named committed samples in
`eval/traces-sample/`. `manifest.json` carries their original SHA-256, source report,
run id, model/config id, seed, level and skill (zero-based index 2).

Original JSONL is per-call evidence: it has no terminal record or model reason
field. Terminal records in this manifest are copied from each sample's matching
committed evaluation report, not inferred from the last action. The watch page
honestly labels absent reasons; it never invents them. Unknown-usage calls make
the recorded cost a lower bound. No new model calls are made by replay.

The history and observation-only model samples both time out. The success sample
is `baseline_aggressive`, distinct from the live `baseline_careful` browser option.
