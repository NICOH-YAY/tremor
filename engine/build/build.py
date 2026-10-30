from pathlib import Path
import os,re,subprocess
root=Path(__file__).resolve().parents[2]
os.chdir(root)
src=root/'engine/doomgeneric/doomgeneric'
objects=re.search(r'SRC_DOOM = (.*)',(src/'Makefile').read_text()).group(1).split()
files=[str(src/x.replace('.o','.c')) for x in objects if x not in ['i_sound.o','doomgeneric_xlib.o']]
files += [str(x) for x in (root/'engine/platform').glob('*.c')]
emcc=Path(os.environ.get('EMSDK',r'D:\Coding VS\tremor-tools\emsdk'))/'upstream/emscripten/emcc.py'
cmd=[os.environ.get('EMSDK_PYTHON',r'D:\Python\python.exe'),str(emcc),*files,'-I'+str(src),'-O2','-DNORMALUNIX','-DLINUX','-D_DEFAULT_SOURCE','-DFEATURE_SOUND','-DDOOMGENERIC_RESX=320','-DDOOMGENERIC_RESY=200','-Wno-error=implicit-function-declaration','-sALLOW_MEMORY_GROWTH=1','-sFORCE_FILESYSTEM=1','-sMODULARIZE=1','-sEXPORT_ES6=1','-sINVOKE_RUN=0','-sASYNCIFY=1','-sASYNCIFY_STACK_SIZE=131072','-sEXPORTED_RUNTIME_METHODS=FS,callMain','-sEXPORTED_FUNCTIONS=_main,_web_key,_web_mouse','-o','public/engine/doom.js']
subprocess.run(cmd,check=True)

# Ship corresponding source beside the binary for static GPL distribution.
import zipfile
Path('public/engine/LICENSE.txt').write_bytes(Path('engine/doomgeneric/LICENSE').read_bytes())
with zipfile.ZipFile('public/engine/source.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(Path('engine').rglob('*')):
        if path.is_file() and path.suffix not in ['.json', '.log']:
            archive.write(path,path.as_posix())
