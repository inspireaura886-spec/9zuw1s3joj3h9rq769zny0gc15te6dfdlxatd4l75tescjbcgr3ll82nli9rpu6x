"""s08 WIDE 28 mm 'Then the tracking showed something stranger.' The two clocks of the path: a dim dashed line where gravity
alone should carry it, and the warm real track peeling slightly outward from it (difference exaggerated, chip
NON-GRAVITATIONAL ACCELERATION, MICHELI ET AL. 2018). Crane DOWN along the lines."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=8, sun_strength=0.5)
sun_ball((0, 0, 0), r=18)
orbit_ring('Ring0', 110)
pts = hyperbola_pts(q=40, e=1.2, n=90)
real = [(x * (1 + 0.004 * max(0, k - 45)), y * (1 + 0.004 * max(0, k - 45)), z) for k, (x, y, z) in enumerate(pts)]
for k in range(45, 89, 2):
    curve_poly('Pred%d' % k, [pts[k], pts[k + 1]], bevel=0.6, mat=glow_mat('PredM%d' % k, color=(0.6, 0.75, 0.9), strength=1.5))
rl = curve_poly('Real', real[45:], bevel=0.9, mat=glow_mat('RealM', color=(1.0, 0.72, 0.5), strength=6.0))
grow_curve(rl, [(0, 0.0), (int(NF * 0.8), 1.0)])
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.crane((-180, 260, 380), (120, 260, 0), dz=-140, dlook=0), lens=28, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
