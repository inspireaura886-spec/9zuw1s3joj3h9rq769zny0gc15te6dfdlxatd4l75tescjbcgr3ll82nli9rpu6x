"""s09 CLOSE 35 mm REVEAL 'It had hit major blood vessels.' A generic glass anatomy figure (teaching model, not his remains): a
flint point near the left shoulder and red-glow vessel lines branching there. Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); alp_mats()
room(size=(6, 5, 3.0), wood_walls=False, window=False, sun_power=0, seed=9)
glass_body('Model', (0, 0, 0), yaw=0)
vm = glow_mat('Vessel', color=(1.0, 0.15, 0.1), strength=4.0)
for k, d in enumerate(((0.25, 0.0, -0.02), (0.18, 0.03, 0.08), (0.12, -0.02, -0.12))):
    curve_poly('Vessel%d' % k, [(-0.05, 0.02, 1.38), (-0.12 - d[0] * 0.4, 0.02, 1.38 + d[2]), (-0.12 - d[0], 0.02 + d[1], 1.36 + d[2])], bevel=0.006, mat=vm)
flint_point('Point', (-0.17, 0.03, 1.33), size=0.035, rot=(math.radians(90), 0, math.radians(30)))
Wd.area('Key', (1.2, -1.2, 2.2), (0, 0, 1.3), color=(0.85, 0.92, 1.0), power=120, size=1.5)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.orbit((-0.12, 0.02, 1.36), r=0.6, a0=-120, a1=-80, h=0.05, look_h=0.0), lens=35, fstop=4, focus=Vector((-0.15, 0.02, 1.36)))
go(cam, NF, a, sc, meter=NF // 2)
