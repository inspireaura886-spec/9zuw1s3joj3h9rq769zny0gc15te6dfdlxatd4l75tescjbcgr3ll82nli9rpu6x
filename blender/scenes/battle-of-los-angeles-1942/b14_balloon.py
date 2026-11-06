"""s14 MEDIUM 35 mm 'Later, two military histories gave their best guess: one stray weather balloon,' A lone weather
balloon and its small sonde drift through one searchlight beam high over the dark basin. Follow (dolly + pan)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
towns = la_night(NF, moon=0.4, seed=8)
for t in towns:
    city_strength(t, [(0, 2.5)])  # blackout: only a few stray lights
weather_balloon('WB', (0, 3000, 1500), NF, drift=(9, 3, 4))
searchlight('SLb', (300, 2000, 5), NF, [(0, (0, 3000, 1500)), (NF, (9, 3003, 1504))], power=4e6, cone=1.2)
Wd.fog(center=(0, 3000, 1400), size=(600, 600, 300), density=0.003, color=(0.75, 0.8, 0.9), anisotropy=0.6)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.follow('WB', (-42, 2950, 1490), (-30, 2945, 1498), look_offset=(0, 0, -2)), lens=35, fstop=8, focus='WB')
go(cam, NF, a, sc, meter=NF // 2)
