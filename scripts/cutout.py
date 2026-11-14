# Local background removal: flood-fill from edges through pixels close to the TABLE color
# (median of border pixels). The white plate (brighter, cooler) stops the fill, so plate+food stay.
import sys, collections, statistics
from PIL import Image, ImageFilter
S = '_src_img/'
def cut(src, box, out, tol=46, size=1100):
    im = Image.open(S + src).convert('RGB'); w, h = im.size
    im = im.crop((int(box[0]*w), int(box[1]*h), int(box[2]*w), int(box[3]*h)))
    W, H = im.size; px = im.load()
    border = [px[x, 0] for x in range(0, W, 3)] + [px[x, H-1] for x in range(0, W, 3)] + [px[0, y] for y in range(0, H, 3)] + [px[W-1, y] for y in range(0, H, 3)]
    bg = tuple(statistics.median(c[i] for c in border) for i in range(3))
    def isbg(c):
        d = ((c[0]-bg[0])**2 + (c[1]-bg[1])**2 + (c[2]-bg[2])**2) ** 0.5
        return d < tol and not (min(c) > 238)  # never eat pure plate white
    mask = Image.new('L', (W, H), 255); m = mask.load(); seen = bytearray(W*H); q = collections.deque()
    for x in range(W): q += [(x, 0), (x, H-1)]
    for y in range(H): q += [(0, y), (W-1, y)]
    while q:
        x, y = q.popleft(); i = y*W + x
        if seen[i]: continue
        seen[i] = 1
        if not isbg(px[x, y]): continue
        m[x, y] = 0
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < W and 0 <= ny < H and not seen[ny*W + nx]: q.append((nx, ny))
    # clean: remove specks, close holes, soften edge
    mask = mask.filter(ImageFilter.MedianFilter(7)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.1))
    rgba = im.convert('RGBA'); rgba.putalpha(mask)
    bb = mask.point(lambda v: 255 if v > 30 else 0).getbbox(); rgba = rgba.crop(bb)
    rgba.thumbnail((size, size)); rgba.save('public/cut/' + out + '.webp', quality=86)
    print(out, rgba.size, 'bg', bg)
    return rgba
JOBS = {
 'pulpo': ('Primos_Pulpo.png', (0, 0, 1, 1)),
 'diabla': ('camarones_diabla.png', (0, 0.12, 1, 1)),
 'coctel': ('Coctel_camaron.png', (0, 0, 1, 0.86)),
 'ajillo': ('camarones_ajillo.png', (0, 0.16, 1, 1)),
 'estrella': ('estrella.png', (0, 0, 1, 1)),
 'brochetas': ('losprimos-rest-especialidad.png', (0, 0, 1, 1)),
 'ribeye': ('Ribeye-1024x774.png', (0, 0, 1, 1)),
 'del-tio': ('del_tio.png', (0, 0, 1, 0.92)),
 'bbq': ('bbq-1024x826.png', (0, 0, 1, 1)),
 'filete-phila': ('Filete-Philadelphia.png', (0, 0.16, 1, 1)),
 'primitos': ('primitos-1024x643.png', (0, 0, 1, 1)),
 'sopa': ('Sopa_mariscos-1.png', (0, 0, 1, 0.93)),
}
only = sys.argv[1:] or list(JOBS)
outs = []
for k in only:
    outs.append(cut(JOBS[k][0], JOBS[k][1], k))
# contact sheet on brand navy
cols = 4; T = 360; rows = (len(outs) + cols - 1)//cols
sheet = Image.new('RGB', (cols*T, rows*T), (13, 77, 133))
for i, o in enumerate(outs):
    o = o.copy(); o.thumbnail((T-20, T-20)); sheet.paste(o, ((i % cols)*T + 10, (i//cols)*T + 10), o)
sheet.save('_brand/cutcheck.png')
