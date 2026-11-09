"""s03 WIDE 28 mm 'That double flash is the signature of a nuclear bomb.' The many-sided Vela satellite over the
night Earth limb, sensors glinting in hard sun. Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
space(sun_az=140, sun_elev=20)
earth(dark=True)
vela_sat('Vela', (0, 0, 0), NF=NF, spin_deg=12)
cam = C.Cam(clip_end=9000)
wide(cam, NF, C.orbit((0, 0, 0), r=9.0, a0=-120, a1=-90, h=1.5), lens=28, fstop=11, focus=9.0)
go(cam, NF, a, sc, meter=NF // 2)
