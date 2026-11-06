"""s14 WIDE 28 mm 'Parachute flares, dropped by Maryland Guard jets over a bombing range.' Four A-10s in trail over the
Goldwater Range; flares pop behind them and drift down on canopies (chip LUU-2B/B FLARES, BARRY M. GOLDWATER RANGE).
Follow."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
desert_mats()
Wd.hdri('qwantani_night_puresky', strength=0.18, bg_strength=0.55, rot=40)
Wd.terrain('Range', size=20000, res=160, height=80, scale=0.001, center=(0, 0, -1500), seed=11,
           mat=bpy.data.materials['DesertRock'])
jets = [a10('A%d' % i, (i * 25, -i * 140, 0), yaw=0) for i in range(4)]
for i, j in enumerate(jets):
    p = j.location.copy()
    key_loc(j, [(0, p), (NF, p + Vector((0, 4.2 * NF, 0)))], interp='LINEAR')
    for k in range(3):
        flare('F%d_%d' % (i, k), (p.x, p.y + 40 + k * 120, -30), NF, fall=0.6, delay=8 + i * 10 + k * 14, smoke=False)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.follow('A0', (-420, -320, 120), (-420, 80, 140), look_offset=(0, -150, -40)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
