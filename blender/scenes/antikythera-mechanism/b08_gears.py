"""s08 MEDIUM 35 mm REVEAL 'Thirty bronze gears, their teeth cut by hand.' A CT-style ghost: thirty gears float in the dark
as a slowly separating stack, cool rim light (chip 30 GEARS, FREETH ET AL. 2021). Orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
anti_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.02, bg_strength=0.0)
gs = gear_train('G', (0, 0, 1.0), n=30, seed=8, mat=bpy.data.materials['BronzeNew'])
for k, g in enumerate(gs):
    p = g.location.copy()
    key_loc(g, [(0, p), (NF, p + Vector((0, 0, (k % 4) * 0.012)))])
Wd.area('Rim', (0.3, 0.4, 1.4), (0, 0, 1.0), color=(0.6, 0.8, 1.0), power=25, size=0.4)
Wd.area('Key', (-0.4, -0.3, 1.3), (0, 0, 1.0), color=(1.0, 0.85, 0.65), power=12, size=0.3)
cam = C.Cam(clip_end=20)
wide(cam, NF, C.orbit((0, 0, 1.0), r=0.42, a0=-100, a1=-60, h=(0.22, 0.16), look_h=0.01), lens=35, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
