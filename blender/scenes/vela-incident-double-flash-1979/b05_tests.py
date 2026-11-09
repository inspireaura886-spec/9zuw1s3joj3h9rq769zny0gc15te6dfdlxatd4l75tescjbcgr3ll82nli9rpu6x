"""s05 WIDE 24 mm 'Every one was a confirmed nuclear test.' Earth from orbit; small amber markers light one after
another across the oceans (ILLUSTRATIVE). Crane up."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
space(sun_az=60, sun_elev=10)
earth()
r = rng(41)
for i in range(41):
    th, ph = r.uniform(0, 2 * math.pi), r.uniform(0.2, 1.35)
    p = EARTH_C + Vector((math.cos(th) * math.sin(ph), math.sin(th) * math.sin(ph) * 0.4 - 0.9, math.cos(ph))).normalized() * (EARTH_R * 1.002)
    m = marker('T%d' % i, p, r=9.0)
    m.hide_render = True
    m.keyframe_insert('hide_render', frame=0)
    m.hide_render = False
    m.keyframe_insert('hide_render', frame=int(4 + i * (NF * 0.8) / 41))
cam = C.Cam(clip_end=20000)
wide(cam, NF, C.crane((0, -2600, 300), (0, 0, -1100), dz=500.0, dlook=0), lens=24, fstop=16)
go(cam, NF, a, sc, meter=int(NF * 0.9))
