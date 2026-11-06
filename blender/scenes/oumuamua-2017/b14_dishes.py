"""s14 WIDE 24 mm 'Radio telescopes listened. Nothing.' A field of small white radio dishes at night, all tilted to the
same patch of sky (chip SETI ALLEN TELESCOPE ARRAY; BREAKTHROUGH LISTEN, GBT: NO SIGNAL). Crane UP."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
space_mats()
Wd.hdri('qwantani_night_puresky', strength=0.15, bg_strength=0.7, rot=200)
Wd.terrain('Valley', size=3000, res=120, height=30, scale=0.003, center=(0, 600, -1), seed=14,
           mat=M.texture_set('Grass', 'forest_ground_04', scale=0.2, tint=(0.35, 0.33, 0.25)))
for i in range(6):
    for j in range(4):
        dish('D%d_%d' % (i, j), (-50 + i * 20 + (j % 2) * 10, 20 + j * 22, 0), d=6.0, alt=55, yaw=-20)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-70, -40, 3), (0, 60, 8), dz=22, dlook=6), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
