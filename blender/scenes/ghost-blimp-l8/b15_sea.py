"""s15 WIDE 24 mm 'Whoever left that gondola never called for help, and never took a parachute.' The empty sea by the
Farallons, the slick thinning out (scale keyed down). Crane UP."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=24, az=120, haze=0.0012)
farallons(center=(200, 2000, 0))
sl, m = oil_slick('Slick', (0, 200, 0), size=280)
key_scale(sl, [(0, 1.0), (NF, 0.55)])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-60, -160, 12), (0, 300, 0), dz=90, dlook=-10), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
