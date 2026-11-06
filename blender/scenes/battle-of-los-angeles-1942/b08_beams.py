"""s08 WIDE 24 mm 'Searchlights crossed. Shells burst for an hour.' The whole basin: 14 sweeping beams, flak bursts
and smoke puffs high over the dark city. Eased dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
towns = la_night(NF, moon=0.4, seed=4)
for t in towns:
    city_strength(t, [(0, 2.5)])  # blackout: only a few stray lights
beams(NF, apex=(0, 6000, 3000), n=14, seed=5, converge=(0.4, 1.0))
flak(NF, center=(0, 6000, 3000), n=30, seed=6)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-600, -3200, 600), (300, -3000, 680), look=(0, 6000, 1800)), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
