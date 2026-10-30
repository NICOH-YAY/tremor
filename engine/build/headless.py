"""Build Node-only synchronous Doom agent module. Requires emsdk only at build time."""
from pathlib import Path
import os,re,subprocess,sys
root=Path(__file__).resolve().parents[2]
os.chdir(root)
src=root/'engine/doomgeneric/doomgeneric'
objects=re.search(r'SRC_DOOM = (.*)',(src/'Makefile').read_text()).group(1).split()
files=[str(src/x.replace('.o','.c')) for x in objects if x not in ['i_sound.o','doomgeneric_xlib.o']]
files += [str(root/'engine/platform'/name) for name in ['doomgeneric_headless.c','i_sound.c','sound_web.c','music_web.c']]
files += [str(root/'engine/tremor'/name) for name in ['tremor.c','agent_api.c']]
files += [str(root/'engine/vendor/nuked-opl3/opl3.c')]
emcc=Path(os.environ.get('EMSDK',r'D:\Coding VS\tremor-tools\emsdk'))/'upstream/emscripten/emcc.py'
testing='--test' in sys.argv
Path('public/engine-headless').mkdir(exist_ok=True)
cmd=[os.environ.get('EMSDK_PYTHON',r'D:\Python\python.exe'),str(emcc),*files,'-I'+str(src),'-I'+str(root/'engine/tremor'),'-O2','-g2','-DNORMALUNIX','-DLINUX','-D_DEFAULT_SOURCE','-DFEATURE_SOUND','-DTR_HEADLESS',*(['-DTR_AGENT_TEST'] if testing else []),'-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Wno-error=implicit-function-declaration','-sALLOW_MEMORY_GROWTH=1','-sFORCE_FILESYSTEM=1','-sMODULARIZE=1','-sENVIRONMENT=node','-sWASM_ASYNC_COMPILATION=0','-sINVOKE_RUN=0','-sEXPORTED_RUNTIME_METHODS=FS,UTF8ToString','-sEXPORTED_FUNCTIONS=_tremor_agent_reset,_tremor_agent_step,_tremor_agent_observe,_tremor_agent_outcome,_tremor_agent_terminate'+(',_tremor_agent_test_exit_fixture,_tremor_agent_test_cower,_tremor_agent_fixture,_tremor_agent_enemy_count,_tremor_agent_test_crew_damage,_tremor_agent_test_kill' if testing else ''),'-o','public/engine-headless/doom-test.cjs' if testing else 'public/engine-headless/doom.cjs']
subprocess.run(cmd,check=True)
output=Path(cmd[-1]);output.write_bytes(output.read_bytes().replace(b"\r\n",b"\n"))

Path('public/engine-headless/LICENSE.txt').write_bytes(Path('engine/doomgeneric/LICENSE').read_bytes().replace(b'\r\n',b'\n'))
# Reproducibility evidence; regenerate after rebuilding both variants.
import hashlib,json
paths=['public/engine/doom.js','public/engine/doom.wasm','public/engine/source.zip','public/radio/lines.json','public/engine-headless/doom.cjs','public/engine-headless/doom.wasm','public/engine-headless/doom-test.cjs','public/engine-headless/doom-test.wasm','public/wad/freedoom1.wad','public/wad/tremor.wad']
manifest={'target':'doomgeneric-tremor-node-v2','step_tics':7,'sha256':{name:hashlib.sha256(Path(name).read_bytes()).hexdigest() for name in paths if Path(name).exists()}}
Path('public/engine-headless/artifacts.json').write_bytes((json.dumps(manifest,indent=2)+'\n').encode('utf-8'))
