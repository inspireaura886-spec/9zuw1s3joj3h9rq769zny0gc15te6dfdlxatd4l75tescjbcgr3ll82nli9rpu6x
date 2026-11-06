"""s13 WIDE 24 mm 'Within days of reaching the island, all three died.' Kvitoya at dusk: one small tent by the rocks under
the ice cap, the sea darkening. Crane DOWN."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
kvitoya(NF, seed=13, dusk=True)
tent('Tent', (6, 118, 0.6), yaw=30)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-60, 20, 40), (6, 118, 2), dz=-30, dlook=4), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
