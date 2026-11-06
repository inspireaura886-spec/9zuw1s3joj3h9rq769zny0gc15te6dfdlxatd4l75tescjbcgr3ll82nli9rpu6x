"""s17 WIDE 24 mm LOOP 'A guess is all anyone ever had. Nobody explained it.' Beams rise from the dark city and meet at one
point upper-centre, the composition of the 1942 photo; push ends on it so Remotion dissolves into the s01 photo card."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
towns = la_night(NF, moon=0.4, seed=1)
for t in towns:
    city_strength(t, [(0, 2.5)])  # blackout: only a few stray lights
beams(NF, apex=(0, 6000, 2600), n=12, seed=11, converge=(0.2, 0.75), spread=2500)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, -1800, 80), (0, 6000, 2600), amount=0.08), lens=24, fstop=16)
go(cam, NF, a, sc, meter=int(NF * 0.9))
