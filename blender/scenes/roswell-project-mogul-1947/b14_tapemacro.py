"""s14 CLOSE 50 mm (accent) 'The purple symbols people recalled matched flower-printed tape from a toy maker.' A balsa
strut of a reflector with the flower-printed tape seam, foil faces catching low sun. Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
desert(sun_elev=12, az=60, warmth='golden', strength=3.5, seed=22, scrub=0, haze=0)
reflector('Ref', (0, 0, 0.9), s=1.0)
debris_field((0, 0, 0), radius=1.5, n=20, seed=14, scale=0.4)
cam = C.Cam()
wide(cam, NF, C.push_in((0.55, -0.9, 1.1), (0.0, 0.0, 0.92), amount=0.35), lens=50, fstop=2.8, focus='Ref')
go(cam, NF, a, sc, meter=NF // 2)
