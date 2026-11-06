"""s12 MEDIUM 35 mm REVEAL 'Tiny writing even describes all five planets the Greeks could see.' A bronze plate with rows of
fine engraved lines; five small warm points light in turn (Mercury..Saturn, illustrative). Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
anti_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.03, bg_strength=0.0)
boxm('Plate', (0, 0, 0), (0.6, 0.4, 0.006), bpy.data.materials['Patina'])
ink = M.principled('Engr', base=(0.05, 0.06, 0.05), rough=0.7)
r = rng(12)
for k in range(30):
    boxm('Line%d' % k, (r.uniform(-0.05, 0.05), 0.17 - k * 0.011, 0.0032), (r.uniform(0.25, 0.45), 0.0015, 0.0005), ink)
for k in range(5):
    gm = glow_mat('PlanetM%d' % k, color=(1.0, 0.8, 0.55), strength=12.0)
    sphere('Planet%d' % k, (-0.2 + k * 0.1, -0.15, 0.006), 0.006, gm, 12)
    key_fac(gm, [(0, 0.0), (int(NF * (0.15 + k * 0.13)), 0.0), (int(NF * (0.15 + k * 0.13)) + 6, 1.0)])
Wd.area('Rake', (0.6, -0.4, 0.25), (0, 0, 0), color=(1.0, 0.88, 0.7), power=20, size=0.3)
cam = C.Cam(clip_end=20)
wide(cam, NF, C.dolly((-0.25, -0.55, 0.38), (0.2, -0.55, 0.38), look=(-0.1, 0, 0), look1=(0.12, 0, 0)), lens=35, fstop=5.6,
     focus=Vector((0, 0, 0)))
go(cam, NF, a, sc, meter=NF // 2)
