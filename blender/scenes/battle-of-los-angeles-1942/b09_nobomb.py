"""s09 MEDIUM 35 mm TWIST 'But not one bomb fell.' Blacked-out bungalow rooftops, untouched, beams crossing overhead.
Push-in over the street."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
towns = la_night(NF, moon=0.45, seed=5, hills=True)
for t in towns:
    city_strength(t, [(0, 2.5)])  # blackout: only a few stray lights
street('St', NF, length=140, houses=10)
beams(NF, apex=(0, 900, 2400), n=8, seed=7, converge=(0.3, 1.0), area=((-2000, 2000), (-400, 3000)))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((3, -20, 18), (0, 160, 60), amount=0.25), lens=35, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
