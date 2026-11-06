"""s04 WIDE 24 mm 'None of them walked out.' The forest wall from the scrub: three tiny figures walk into the dark tree
line and are swallowed. Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=4, n_trees=70, n_palms=12, area=(-120, 120, 30, 220), sun_elev=15, az=250, haze=0.01)
for k in range(3):
    w = walker('W%d' % k, (-1.5 + 1.4 * k, 18, 0), yaw=0)
    walk(w, NF, (-1.5 + 1.4 * k, 18, 0), (-1.5 + 1.4 * k, 34, 0))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, -30, 2.2), (0, 36, 4), amount=0.18), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
