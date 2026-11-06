"""s07 WIDE 28 mm MOMENT 'Their father ran for the ladder he kept against the house.' The side wall in flickering fire light:
a pale, unweathered stripe on the siding where the ladder always leaned; a barefoot adult figure runs into frame. Orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
winter_night(NF, seed=7, moon=0.15)
house('House', (0, 0, 0), lit=True, xmas=False)
fire('Fire', (0, 0, 5.5), (8, 6, 4), NF, seed=7, power=18000)
boxm('Stripe', (5.03, -1.0, 3.2), (0.02, 0.55, 5.8), M.principled('PaleSiding', base=(0.86, 0.84, 0.78), rough=0.8))
g = figure('George', (9, -6, 0), yaw=135, h=1.75, pose='reach')
key_loc(g, [(0, (11, -9, 0)), (int(NF * 0.7), (6.6, -1.6, 0))])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.orbit((5, -1, 2.4), r=12, a0=-60, a1=-35, h=1.2, look_h=0.8), lens=28, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
