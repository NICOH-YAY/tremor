from pathlib import Path
import os,re,subprocess
root=Path(__file__).resolve().parents[2]
os.chdir(root)
src=root/'engine/doomgeneric/doomgeneric'
objects=re.search(r'SRC_DOOM = (.*)',(src/'Makefile').read_text()).group(1).split()
files=[str(src/x.replace('.o','.c')) for x in objects if x not in ['i_sound.o','doomgeneric_xlib.o']]
files += [str(x) for x in (root/'engine/platform').glob('*.c') if x.name!='doomgeneric_headless.c']
files += [str(root/'engine/tremor/tremor.c'),str(root/'engine/vendor/nuked-opl3/opl3.c')]
import sys
testing='--test' in sys.argv
previous='--previous-light' in sys.argv
reference='--vanilla-light' in sys.argv or previous
if testing: files += [str(root/'engine/tremor/tests.c')]
emcc=Path(os.environ.get('EMSDK',r'D:\Coding VS\tremor-tools\emsdk'))/'upstream/emscripten/emcc.py'
cmd=[os.environ.get('EMSDK_PYTHON',r'D:\Python\python.exe'),str(emcc),*files,'-I'+str(src),'-I'+str(root/'engine/tremor'),*(['-DTR_TEST'] if testing else []),*(['-DTR_PREVIOUS_LIGHT' if previous else '-DTR_VANILLA_LIGHT'] if reference else []),'-lidbfs.js','-O2','-DNORMALUNIX','-DLINUX','-D_DEFAULT_SOURCE','-DFEATURE_SOUND','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Wno-error=implicit-function-declaration','-sALLOW_MEMORY_GROWTH=1','-sFORCE_FILESYSTEM=1','-sMODULARIZE=1','-sEXPORT_ES6=1','-sINVOKE_RUN=0','-sASYNCIFY=1','-sASYNCIFY_STACK_SIZE=131072','-sEXPORTED_RUNTIME_METHODS=FS,IDBFS,HEAPU8,HEAP16,callMain','-sEXPORTED_FUNCTIONS=_main,_web_key,_web_mouse,_web_read_mouse,_tremor_set_gore,_tremor_set_mouse_sensitivity,_tremor_set_volumes,_tremor_bind_key'+(',_tremor_test' if testing else ''),'-o','engine/build/test-engine.js' if testing else ('engine/build/previous-engine.js' if previous else 'engine/build/reference-engine.js') if reference else 'public/engine/doom.js']
subprocess.run(cmd,check=True)
output=Path(cmd[-1]);output.write_bytes(output.read_bytes().replace(b"\r\n",b"\n"))
if testing or reference: sys.exit(0)

# Ship corresponding source beside the binary for static GPL distribution.
import zipfile
Path('public/engine/LICENSE.txt').write_bytes(Path('engine/doomgeneric/LICENSE').read_bytes().replace(b'\r\n',b'\n'))
with zipfile.ZipFile('public/engine/source.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(Path('engine').rglob('*')):
        if path.is_file() and path.suffix not in ['.json', '.log', '.wasm'] and not path.name.startswith(('test-engine.', 'reference-engine.', 'previous-engine.')):
            archive.write(path,path.as_posix())

    for name in ['scripts/build-tremor-wad.py','public/art/crew.png','public/engine-page.js','public/startup.js','public/horror.js','public/radio/lines.json','public/settings-store.js','public/settings-ui.js','index.html','package.json','vite.config.ts']:
        archive.write(name,name)
