"""s07 WIDE 28 mm 'The guns opened up.' 3-inch AA gun in a sandbag pit on the blacked-out basin edge; muzzle flashes,
searchlight beams behind (chip '3:16 AM'). Orbit 40 deg around the pit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
towns = la_night(NF, moon=0.4, seed=3)
for t in towns:
    city_strength(t, [(0, 2.5)])  # blackout: only a few stray lights
aa_gun('Gun', (0, -800, 0), NF, yaw=10, elev=58, shots=(8, 22, 36, 49))
aa_gun('Gun2', (60, -760, 0), NF, yaw=0, elev=62, shots=(15, 30, 44))
beams(NF, apex=(0, 5000, 3000), n=10, seed=4, converge=(0.2, 0.9), area=((-3000, 3000), (-600, 4000)))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.orbit((0, -800, 1.5), r=16, a0=-130, a1=-90, h=(2.5, 3.5), look_h=4.0), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
