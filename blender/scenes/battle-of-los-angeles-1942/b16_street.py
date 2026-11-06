"""s16 WIDE 28 mm 'Five civilians still died that night, in blackout car crashes and of heart attacks.' Dark residential street,
a 1940s sedan stopped askew against a lamp post, hooded headlights on; no people shown. Beams overhead. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
towns = la_night(NF, moon=0.45, seed=9)
for t in towns:
    city_strength(t, [(0, 2.5)])  # blackout: only a few stray lights
street('St', NF, length=140, houses=10)
car1940('Car', (4.0, 34.5, 0), yaw=-32)
beams(NF, apex=(0, 900, 2400), n=6, seed=10, converge=(0.3, 1.0), area=((-2000, 2000), (-400, 3000)))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((-3.5, 12, 2.4), (4.5, 37, 0.9), amount=0.3), lens=28, fstop=5.6, focus='Car')
go(cam, NF, a, sc, meter=NF // 2)
