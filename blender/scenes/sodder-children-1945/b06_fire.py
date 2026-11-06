"""s06 WIDE 24 mm 'Their parents and four siblings had escaped.' The house ablaze at night from across the field; six
small backlit silhouettes stand at a distance (faceless, no close child figure). Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
winter_night(NF, seed=6, moon=0.15)
house('House', (0, 0, 0), lit=True, xmas=False)
fire('Fire', (0, 0, 4.5), (9, 7, 6), NF, seed=6)
for k, h in enumerate((1.80, 1.65, 1.75, 1.78, 1.70, 1.05)):
    figure('S%d' % k, (-7 + 1.4 * k, -16 + 0.3 * (k % 2), 0), yaw=0, h=h)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((-4, -46, 1.7), (0, 0, 4), amount=0.12), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
