# Demo trace

This is a demo, not part of the declared suite. No demo has been run in codex-doom18. Demo results do not enter EVALUATION tables. The human runs the following with Vertex credentials:

```sh
# cwd: midterms/nicoh-yay
npm run demo:live
npm run demo:copy
```

The trace is kept gzipped; `gunzip -c eval/demo/demo-model-history-E1M1-17.jsonl.gz` reproduces the plaintext from the repository root.

The same commands work from the Tremor repository root. This runs one model-history episode on E1M1 seed 17, using the current model configuration, K=8 and the suite limits. The copy command adds a labelled watch-page replay. Existing suite traces and tables remain unchanged.
