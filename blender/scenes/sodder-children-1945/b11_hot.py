"""s11 WIDE 24 mm 'The fire chief said it burned hot enough to leave nothing.' The fire at its peak from the road, the roof
caving, sparks climbing into the night. Crane UP with the sparks."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
winter_night(NF, seed=11, moon=0.12)
house('House', (0, 0, 0), lit=True, xmas=False)
fire('Fire', (0, 0, 5.0), (10, 8, 7), NF, seed=11, power=40000)
sp = glow_mat('Spark', color=(1.0, 0.6, 0.2), strength=20)
r = rng(11)
for k in range(60):
    p0 = Vector((r.uniform(-4, 4), r.uniform(-3, 3), r.uniform(8, 12)))
    s = sphere('Spark%d' % k, p0, 0.04, sp, 6)
    key_loc(s, [(0, p0), (NF, p0 + Vector((r.uniform(1, 4), r.uniform(-1, 1), r.uniform(10, 22))))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((6, -34, 1.6), (0, 0, 6), dz=7, dlook=10), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
