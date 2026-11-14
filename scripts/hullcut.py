# Clean plate cutout: foreground = far from border/table color -> despeckle -> convex hull polygon -> crisp antialiased mask.
import statistics
from PIL import Image, ImageFilter, ImageDraw
def hull(pts):
    pts = sorted(set(pts))
    if len(pts) < 3: return pts
    def cross(o, a, b): return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lo, up = [], []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0: lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(up) >= 2 and cross(up[-2], up[-1], p) <= 0: up.pop()
        up.append(p)
    return lo[:-1] + up[:-1]
def cut(src, out, tol, box=(0,0,1,1), size=1200, shrink=2):
    im = Image.open(src).convert('RGB'); w, h = im.size
    im = im.crop((int(box[0]*w), int(box[1]*h), int(box[2]*w), int(box[3]*h)))
    W, H = im.size; px = im.load()
    border = [px[x, 0] for x in range(0, W, 2)] + [px[x, H-1] for x in range(0, W, 2)] + [px[0, y] for y in range(0, H, 2)] + [px[W-1, y] for y in range(0, H, 2)]
    bg = tuple(statistics.median(c[i] for c in border) for i in range(3))
    fg = Image.new('L', (W, H), 0); f = fg.load()
    for y in range(H):
        for x in range(W):
            c = px[x, y]
            if ((c[0]-bg[0])**2 + (c[1]-bg[1])**2 + (c[2]-bg[2])**2) ** 0.5 > tol: f[x, y] = 255
    fg = fg.filter(ImageFilter.MedianFilter(9)).filter(ImageFilter.MinFilter(5))
    f = fg.load(); step = 2
    pts = [(x, y) for y in range(0, H, step) for x in range(0, W, step) if f[x, y]]
    poly = hull(pts)
    S = 4  # supersample for antialiased edge
    big = Image.new('L', (W*S, H*S), 0)
    ImageDraw.Draw(big).polygon([(x*S, y*S) for x, y in poly], fill=255)
    mask = big.resize((W, H), Image.LANCZOS).filter(ImageFilter.MinFilter(1 + 2*shrink)).filter(ImageFilter.GaussianBlur(0.6))
    rgba = im.convert('RGBA'); rgba.putalpha(mask)
    rgba = rgba.crop(mask.getbbox()); rgba.thumbnail((size, size), Image.LANCZOS)
    rgba.save('public/cut/' + out + '.webp', quality=88); print(out, rgba.size, bg)
    return rgba
outs = [
  cut('_src_img/Primos_Pulpo.png', 'pulpo', 60),
  cut('_src_img/pulpozarandeado-1.png', 'pulpo-dark', 60),
  cut('_src_img/estrella.png', 'estrella', 55),
  cut('_src_img/losprimos-rest-especialidad.png', 'brochetas', 40),
]
T = 420; sheet = Image.new('RGB', (T*len(outs), T), (13, 77, 133))
for i, o in enumerate(outs):
    o = o.copy(); o.thumbnail((T-20, T-20)); sheet.paste(o, (i*T + 10, 10), o)
sheet.save('_brand/cutcheck.png')
