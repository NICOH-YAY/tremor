# Representative traces

Scripted suite samples are `baseline-success.jsonl.gz`, `baseline-death.jsonl.gz` and `baseline-limit.jsonl.gz`, generated from eval/results/2026-10-31-2026-10-31T06-16-26-402Z-results.json. The additional scripted sample `baseline-careful-success.jsonl.gz` is identified in public/replays/manifest.json.

Live model suite samples are `model-history-E1M1-17.jsonl.gz` and `model-obs-only-E1M1-17.jsonl.gz`. See `manifest.json` for their source report, run IDs and exact SHA-256 hashes, and for the three original scripted samples.

The separate live model demo is `demo/demo-model-history-E1M1-17.jsonl.gz`, with its outcome in `demo/report.json`. It retains model reasons and is not part of the declared suite.

These seven gzip traces, the two JSON manifests/reports and this README are the tracked inventory in this sample folder. The [complete declared-suite set](../traces-full/2026-10-31-declared-suite/) contains all 56 traces with a manifest of hashes and outcomes. No credentials or hidden-state handles are in controller observations.

## Read a trace

From the repository root, this one-line command prints the first three JSONL records to stdout without writing files. It works in Git Bash and PowerShell:

```sh
node -e "console.log(require('zlib').gunzipSync(require('fs').readFileSync('eval/traces-sample/model-history-E1M1-17.jsonl.gz')).toString('utf8').trimEnd().split(String.fromCharCode(10)).slice(0,3).join(String.fromCharCode(10)))"
```

Top-level fields in the declared suite samples:

| Fields | Meaning |
|---|---|
| `step`, `observation` | Step index and public observation encoded as a JSON string. |
| `action`, `source`, `valid`, `feedback` | Submitted action (or null), decision source, validation flag and optional validation feedback. |
| `latencyMs`, `tokensIn`, `tokensOut`, `estimatedCost` | Decision latency, recorded token counts and estimated cost (which can be null). |
| `error` | Optional controller error text, present in the model samples. |

The separate demo also contains `reason`, the retained model reason. The declared model suite samples do not contain this field.
