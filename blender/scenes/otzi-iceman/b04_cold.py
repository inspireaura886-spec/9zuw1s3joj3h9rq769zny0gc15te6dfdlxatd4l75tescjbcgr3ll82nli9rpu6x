"""s04 WIDE 24 mm 'For ten years, experts blamed the cold.' Blowing snow across the empty pass under a flat grey sky. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
alps(NF, seed=4, sun_elev=16, az=180, warmth='noon', haze=0.004, snowfall=220)
bpy.data.objects['CineSun'].data.energy = 1.2
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, -6, 2.0), (0, 40, 1.0), amount=0.2), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
