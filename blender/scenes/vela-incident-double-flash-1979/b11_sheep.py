"""s11 WIDE 28 mm 'But in Australia, sheep were reported to carry traces of radioactive iodine.' TWIST: dusk paddock,
a small flock of sheep behind a wire fence (chip REPORTED). Crane down."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
paddock(NF)
r = rng(11)
for i in range(16):
    sheep('Sheep%d' % i, (r.uniform(-14, 14), r.uniform(9, 40), 0), yaw=r.uniform(0, 360), s=r.uniform(0.9, 1.1))
cam = C.Cam(clip_end=20000)
wide(cam, NF, C.crane((-4, -12, 6.0), (0, 20, 0.8), dz=-3.6, dlook=0), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
