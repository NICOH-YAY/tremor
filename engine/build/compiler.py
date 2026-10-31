import os,sys,shutil
from pathlib import Path
def compiler():
    sdk=os.environ.get('EMSDK')
    if sdk:return [os.environ.get('EMSDK_PYTHON',sys.executable),str(Path(sdk)/'upstream/emscripten/emcc.py')]
    command=shutil.which('emcc')
    if not command:raise RuntimeError('Set EMSDK to an activated Emscripten SDK or put emcc on PATH')
    return [command]
