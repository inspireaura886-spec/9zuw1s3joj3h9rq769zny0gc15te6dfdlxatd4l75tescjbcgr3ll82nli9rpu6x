"""s14 WIDE 24 mm 'Who fired that arrow?' The empty pass at dawn; a single line of old footprints climbs the snow. Crane UP."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
alps(NF, seed=14, sun_elev=15, az=95, warmth='golden', gully=False)
pm = M.principled('Print', base=(0.55, 0.6, 0.7), rough=0.7)
for k in range(40):
    sphere('FP%d' % k, (0.4 * (k % 2) - 0.2 + 0.3 * math.sin(k * 0.3), 4 + 0.8 * k, 0.02), 0.13, pm, 10, scale=(0.9, 1.6, 0.15))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-3, -6, 1.6), (0, 30, 1.0), dz=10, dlook=3), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
