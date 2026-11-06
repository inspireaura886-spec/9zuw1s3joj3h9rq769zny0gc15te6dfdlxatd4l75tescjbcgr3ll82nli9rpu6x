"""s03 WIDE 24 mm REVEAL 'And it was already leaving.' Illustrative inner solar system: the Sun, faint orbit rings, a warm
path line that came in steeply from above the planets' plane, swung past the Sun and is heading out; a dot rides the
outbound leg (chip FOUND 40 DAYS AFTER CLOSEST APPROACH). Crane UP."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=3, sun_strength=0.5)
sun_ball((0, 0, 0), r=18)
for k, R_ in enumerate((60, 110, 150, 230)):
    orbit_ring('Ring%d' % k, R_)
pts = hyperbola_pts(q=40, e=1.2, n=90, tilt=0.8)
path = curve_poly('Path', pts, bevel=0.8, mat=glow_mat('PathM', color=(1.0, 0.72, 0.5), strength=5.0))
grow_curve(path, [(0, 0.55), (NF, 0.85)])
dot = sphere('Dot', pts[50], 3.0, glow_mat('DotM', color=(1.0, 0.85, 0.7), strength=12.0), 16)
key_loc(dot, [(0, pts[50]), (NF, pts[76])], interp='LINEAR')
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.crane((-120, -560, 90), (0, 40, 0), dz=200, dlook=0), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
