"""s10 WIDE 24 mm 'Not one plane came down.' Beams converge on an empty patch of sky, smoke drifting through them.
Crane UP toward the apex."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
towns = la_night(NF, moon=0.4, seed=6)
for t in towns:
    city_strength(t, [(0, 2.5)])  # blackout: only a few stray lights
beams(NF, apex=(0, 6000, 3000), n=12, seed=8, converge=(0.0, 0.5))
flak(NF, center=(0, 6000, 3000), n=10, seed=9, f0=0, f1=10, puff=80)
smoke_layer((0, 6000, 3000), (2500, 2500, 400), density=0.002)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((0, -1500, 150), (0, 6000, 3000), dz=500, dlook=0), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
