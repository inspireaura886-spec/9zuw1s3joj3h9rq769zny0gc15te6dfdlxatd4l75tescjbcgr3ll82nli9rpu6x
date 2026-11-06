"""s02 WIDE 24 mm 'They hit nothing.' A dozen searchlight cones already crossed on empty sky above the blacked-out
basin, a few flak puffs fading. Slow push toward the empty apex."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
towns = la_night(NF, moon=0.4, seed=1)
for t in towns:
    city_strength(t, [(0, 2.5)])  # blackout: only a few stray lights
beams(NF, apex=(0, 6000, 3200), n=12, seed=1, converge=(0.0, 0.3))
flak(NF, center=(0, 6000, 3200), n=8, seed=3, f0=0, f1=6)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, -2500, 260), (0, 6000, 3200), amount=0.06), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
