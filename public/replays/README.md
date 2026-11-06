# Served recording evidence

The five gzip files are byte-identical copies of the named committed samples in
`eval/traces-sample/`. `manifest.json` carries their original SHA-256, source report,
run id, model/config id, seed, level and skill (zero-based index 2).

The four original suite JSONL samples are per-call evidence: they have no terminal record or model reason
field. The newer `demo-model-history-E1M1-17.jsonl.gz` retains model reasons and is separate from the declared suite. Terminal records in this manifest are copied from each sample's matching
committed evaluation report, not inferred from the last action. The watch page
honestly labels absent reasons; it never invents them. Unknown-usage calls make
the recorded cost a lower bound. No new model calls are made by replay.

The history and observation-only model samples both time out. The success samples
are `baseline-success.jsonl.gz` for `baseline_aggressive` and
`baseline-careful-success.jsonl.gz` for `baseline_careful`. The directory also
contains `manifest.json`, `results.json` and this README, for eight tracked files.
