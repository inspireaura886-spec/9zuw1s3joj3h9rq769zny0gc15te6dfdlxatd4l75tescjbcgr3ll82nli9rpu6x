"""s15 WIDE 28 mm 'So who lit up the ocean that night?' From orbit: the satellite small against the dark southern
Earth. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
space(sun_az=200, sun_elev=12)
earth(dark=True)
vela_sat('Vela', (0, 0, 0), NF=NF, spin_deg=8)
cam = C.Cam(clip_end=9000)
wide(cam, NF, C.push_in((6, -26, 9), (0, 0, -60), amount=0.15), lens=28, fstop=11, focus=26.0)
go(cam, NF, a, sc, meter=NF // 2)
