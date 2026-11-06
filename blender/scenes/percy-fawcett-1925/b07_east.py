"""s07 WIDE 24 mm 'Then the three walked east, into unmapped forest.' A narrow trail into deep forest, low sun behind; the three
walk away from camera. Follow from behind (eased dolly)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=7, n_trees=90, n_palms=16, area=(-70, 70, -20, 200), lane=lambda x, y: abs(x - 1.5 * math.sin(y * 0.06)) < 3.5, sun_elev=16, az=270, haze=0.016)
for k in range(3):
    w = walker('W%d' % k, (0.4 * (k - 1), 6 + 2.2 * k, 0), yaw=0)
    walk(w, NF, (0.4 * (k - 1), 6 + 2.2 * k, 0), (0.4 * (k - 1), 6 + 2.2 * k + NF * 0.035, 0))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((0, -6, 1.8), (0, -6 + NF * 0.035, 1.8), look=(0, 30, 2.2), look1=(0, 30 + NF * 0.035, 2.2)), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
