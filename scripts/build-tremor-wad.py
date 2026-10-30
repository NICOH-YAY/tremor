"""Build original CREW pictures and Freedoom horror palette replacements; usage: python scripts/build-tremor-wad.py [IWAD].

Requires Pillow. The default palette is the bundled Freedoom PLAYPAL. For a
different palette pass the selected IWAD. Replacement monsters derive from that IWAD;
do not distribute proprietary IWAD-derived output. The bundled default is Freedoom.
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
    # Freedoom-derived replacement patches retain every original offset/post.
    # Only palette indices change; no proprietary sprite data is distributed.
    source=Path(iwad).read_bytes()
    count,di=unpack_from('<ii',source,4)
    prefixes={'POSS','SPOS','CPOS','TROO','SARG','HEAD','SKUL','BOSS','BOS2'}
    def nearest(rgb):
        return min(range(256),key=lambda j:sum((rgb[k]-colors[j][k])**2 for k in range(3)))
    translation=[]
    for r,g,blue in colors:
        lum=(r*3+g*6+blue)//10
        if r>g*1.35 and r>blue*1.35:
            rgb=(int(r*.48),int(g*.19),int(blue*.22))
        elif lum<55: rgb=(int(lum*.35),int(lum*.4),int(lum*.38))
        else: rgb=(int(lum*.76),int(lum*.82),int(lum*.69))
        translation.append(nearest(rgb))
    for i in range(count):
        pos,size,raw=unpack_from('<ii8s',source,di+i*16)
        name=raw.rstrip(b'\0').decode('ascii')
        if name[:4] not in prefixes or size<8: continue
        data=bytearray(source[pos:pos+size])
        width,height=unpack_from('<hh',data)
        if width<=0 or 8+width*4>size: continue
        visited=set()
        for x in range(width):
            off=unpack_from('<I',data,8+x*4)[0]
            if off in visited:continue
            visited.add(off)
            while off<size and data[off]!=255:
                top,length=data[off],data[off+1]
                for y in range(length):
                    at=off+3+y
                    if at>=size:break
                    # Blackened upper facial band, preserving transparent posts.
                    idx=data[at]
                    data[at]=translation[idx]
                    if height*.18<top+y<height*.27 and width*.35<x<width*.65:
                        r,g,b=colors[data[at]];data[at]=nearest((r//3,g//3,b//3))
                off+=length+4
        lumps.insert(-1,(name,bytes(data)))
    body, directory = bytearray(), bytearray()
    for name, data in lumps:
        directory += pack('<ii8s',12+len(body),len(data),name.encode().ljust(8,b'\0'))
        body += data
    Path(output).write_bytes(pack('<4sii',b'PWAD',len(lumps),12+len(body))+body+directory)

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv)>1 else ROOT/'public/wad/freedoom1.wad',ROOT/'public/wad/tremor.wad')
