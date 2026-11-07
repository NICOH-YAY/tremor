# Complete declared-suite traces

This folder contains the complete declared-suite set: 56 traces, 4 players x 7 maps x 2 seeds, from the [results JSON](../../results/2026-10-31-2026-10-31T06-19-01-385Z-results.json). Each decompressed file is byte-identical to the local runner output. The recorded source paths name gzip files; these copies use deterministic gzip level 9 compression with no filename or mtime.

The [manifest](manifest.json) records each episode's player, map, seed, split, terminal reason, source trace path, uncompressed and gzip SHA-256 hashes, and byte sizes. Episode metadata comes from the results JSON.

From the repository root, print the first three JSONL records without writing files:

```sh
node -e "console.log(require('zlib').gunzipSync(require('fs').readFileSync('eval/traces-full/2026-10-31-declared-suite/2026-10-31T06-19-01-385Z-baseline_aggressive-E1M1-17.jsonl.gz')).toString('utf8').trimEnd().split(String.fromCharCode(10)).slice(0,3).join(String.fromCharCode(10)))"
```
