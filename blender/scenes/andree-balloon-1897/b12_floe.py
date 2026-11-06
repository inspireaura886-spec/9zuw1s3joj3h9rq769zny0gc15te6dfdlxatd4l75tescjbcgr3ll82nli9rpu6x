"""s12 WIDE 28 mm 'until their ice floe camp broke apart in October.' The camp floe cracks: its two halves drift apart and
dark water opens between them, the tent on one side. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
arctic(NF, sun_elev=2, az=200, strength=1.8, haze=0.0016, seed=12, floes=30)
fa = floe('CampA', (-7, 40, 0.2), 14, seed=91, thick=1.4)
fb = floe('CampB', (7, 40, 0.2), 13, seed=92, thick=1.4)
t = tent('Tent', (-9, 40, 0.75), yaw=20)
f0 = int(NF * 0.25)
for o, dx in ((fa, -5), (fb, 6), (t, -5)):
    p = o.location.copy()
    key_loc(o, [(0, p), (f0, p), (NF, p + Vector((dx, 0, 0)))])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-30, -12, 9), (-12, -16, 9.5), look=(0, 40, 0), look1=(2, 40, 0)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
