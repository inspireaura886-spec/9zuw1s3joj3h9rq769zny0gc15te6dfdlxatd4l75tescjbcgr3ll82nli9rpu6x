"""b11 (WIDE 28 mm, 'reached Horseshoe Bay'): simulated launch paths on the map. A green path curves from Alcatraz into Horseshoe Bay; red paths sweep out through the Golden Gate to sea. Push along the green path."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 147, int)
sc = core.reset(); look(sc, vol=False, glare=0.6, glare_thr=0.9, vignette=0.3)
map_light()
mp = hydro_map(NF, flow=True, window=True)
key_strength(mp['arr'], [(0, 0.8), (NF, 0.6)])
def bez(p0, p1, p2, n=40, z=0.32):
    out = []
    for k in range(n + 1):
        t = k / n
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
        out.append((x, y, z))
    return out
green = glow_mat('PathGreen', (0.45, 1.0, 0.6), 9.0)
coral = glow_mat('PathCoral', (0.95, 0.35, 0.28), 6.0)
g = curve_poly('PathG', bez((4.8, 0.78), (2.6, 1.75), (0.45, 1.28)), bevel=0.055, mat=green)
grow_curve(g, [(0, 0.0), (12, 0.0), (NF - 25, 1.0), (NF, 1.0)])
reds = [bez((4.8, 0.7), (2.2, -0.35), (-6.8, 0.15), n=50), bez((4.8, 0.7), (2.8, 0.2), (-6.8, 0.45), n=50), bez((4.8, 0.72), (2.0, 1.0), (-6.8, 0.7), n=50),
        bez((4.8, 0.7), (3.5, -0.6), (-6.5, -0.15), n=50)]
for i, pts in enumerate(reds):
    r = curve_poly('PathR%d' % i, pts, bevel=0.04, mat=coral)
    grow_curve(r, [(0, 0.0), (6 + 4 * i, 0.0), (NF - 15, 1.0), (NF, 1.0)])
cam = C.Cam(clip_end=300)
cam.shot(0, NF, C.dolly((6.8, -3.4, 4.6), (2.6, -0.6, 3.7), look=(3.0, 1.0, 0), look1=(0.3, 1.2, 0)), lens=28, fstop=9, focus=Vector((2.0, 1.0, 0)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
