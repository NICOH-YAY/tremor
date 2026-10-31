"""Normalize shipped text and refresh hashes without rebuilding WASM."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[2]
paths = ['public/engine/doom.js', 'public/engine/doom.wasm', 'public/engine/source.zip', 'public/radio/lines.json', 'public/engine-headless/doom.cjs', 'public/engine-headless/doom.wasm', 'public/engine-headless/doom-test.cjs', 'public/engine-headless/doom-test.wasm', 'public/wad/freedoom1.wad', 'public/wad/tremor.wad']
hashes = {}
for name in paths:
    path = root / name
    if not path.exists():
        continue
    data = path.read_bytes()
    if path.suffix in {'.js', '.cjs', '.json'}:
        normalized = data.replace(b'\r\n', b'\n').replace(b'\r', b'\n')
        if normalized != data:
            path.write_bytes(normalized)
        data = normalized
    hashes[name] = hashlib.sha256(data).hexdigest()
manifest = {'target': 'doomgeneric-tremor-node-v3', 'step_tics': 7, 'sha256': hashes}
(root / 'public/engine-headless/artifacts.json').write_bytes((json.dumps(manifest, indent=2) + '\n').encode('utf-8'))
