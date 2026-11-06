"""s11 MEDIUM 30 mm REVEAL 'A small cut in his skin matched the arrow's path.' The glass teaching figure from behind: a thin glowing
line grows from the back of the left shoulder to the flint point (chip 2 CM CUT). Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); alp_mats()
room(size=(6, 5, 3.0), wood_walls=False, window=False, sun_power=0, seed=11)
glass_body('Model', (0, 0, 0), yaw=0)
line = curve_poly('Path', [(-0.16, -0.25, 1.40), (-0.165, -0.08, 1.36), (-0.17, 0.03, 1.33)], bevel=0.004, mat=glow_mat('PathG', color=(1.0, 0.85, 0.6), strength=6.0))
grow_curve(line, [(0, 0.0), (int(NF * 0.6), 1.0)])
flint_point('Point', (-0.17, 0.03, 1.33), size=0.035, rot=(math.radians(90), 0, math.radians(30)))
Wd.area('Key', (-1.2, -1.5, 2.2), (0, 0, 1.3), color=(0.85, 0.92, 1.0), power=120, size=1.5)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.dolly((-0.9, -1.4, 1.45), (-0.3, -1.4, 1.45), look=(-0.16, 0, 1.36), look1=(-0.16, 0, 1.36)), lens=30, fstop=4, focus=Vector((-0.16, -0.1, 1.37)))
go(cam, NF, a, sc, meter=NF // 2)
