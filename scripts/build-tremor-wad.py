"""Build original CREW pictures; usage: python scripts/build-tremor-wad.py [IWAD].

Requires Pillow. The default palette is the bundled Freedoom PLAYPAL. For a
different palette pass the selected IWAD. No palette/game assets are emitted.
"""
from pathlib import Path
from struct import pack, unpack_from
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def palette(wad):
    data = Path(wad).read_bytes()
    count, directory = unpack_from('<ii', data, 4)
    for i in range(count):
        pos, size, name = unpack_from('<ii8s', data, directory+i*16)
        if name.rstrip(b'\0') == b'PLAYPAL':
            assert size >= 768
            return [tuple(data[pos+j:pos+j+3]) for j in range(0, 768, 3)]
    raise ValueError('IWAD has no PLAYPAL')

def picture(image, colors):
    width, height = image.size
    columns, offsets, cache = [], [], {}
    cursor = 8+4*width
    for x in range(width):
        column = bytearray()
        y = 0
        while y < height:
            if image.getpixel((x,y))[3] < 128:
                y += 1
                continue
            top, pixels = y, bytearray()
            while y < height and image.getpixel((x,y))[3] >= 128:
                rgb = image.getpixel((x,y))[:3]
                if rgb not in cache:
                    cache[rgb] = min(range(256), key=lambda j: sum((rgb[k]-colors[j][k])**2 for k in range(3)))
                pixels.append(cache[rgb])
                y += 1
            column += bytes((top,len(pixels),0))+pixels+b'\0'
        column += b'\xff'
        offsets.append(cursor)
        columns.append(column)
        cursor += len(column)
    return pack('<hhhh',width,height,width//2,height)+pack('<'+'I'*width,*offsets)+b''.join(columns)

def build(iwad, output):
    colors = palette(iwad)
    original = Image.open(ROOT/'public/art/crew.png').convert('RGBA')
    # Doom-sized silhouette, preserving alpha. B visibly ducks/flinches.
    a = original.resize((48,64),Image.Resampling.NEAREST)
    b = Image.new('RGBA',a.size)
    b.alpha_composite(a.resize((48,56),Image.Resampling.NEAREST),(0,8))
    lumps = [('S_START',b''),('CREWA0',picture(a,colors)),('CREWB0',picture(b,colors)),('S_END',b'')]
    body, directory = bytearray(), bytearray()
    for name, data in lumps:
        directory += pack('<ii8s',12+len(body),len(data),name.encode().ljust(8,b'\0'))
        body += data
    Path(output).write_bytes(pack('<4sii',b'PWAD',len(lumps),12+len(body))+body+directory)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv)>1 else ROOT/'public/wad/freedoom1.wad',ROOT/'public/wad/tremor.wad')
