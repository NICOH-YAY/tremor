# Representative traces

Scripted suite samples are `baseline-success.jsonl.gz`, `baseline-death.jsonl.gz` and `baseline-limit.jsonl.gz`, generated from eval/results/2026-10-31-2026-10-31T06-16-26-402Z-results.json. The additional scripted sample `baseline-careful-success.jsonl.gz` is identified in public/replays/manifest.json.

Live model suite samples are `model-history-E1M1-17.jsonl.gz` and `model-obs-only-E1M1-17.jsonl.gz`. See `manifest.json` for their source report, run IDs and exact SHA-256 hashes, and for the three original scripted samples.

The separate live model demo is `demo/demo-model-history-E1M1-17.jsonl.gz`, with its outcome in `demo/report.json`. It retains model reasons and is not part of the declared suite.

These seven gzip traces, the two JSON manifests/reports and this README are the tracked inventory. No credentials or hidden-state handles are in controller observations.
