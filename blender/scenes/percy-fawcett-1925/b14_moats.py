"""s14 WIDE 24 mm REVEAL 'And Z? Archaeologists have since mapped ancient moated towns in that same forest.' Aerial: three
concentric dark moat rings and straight causeways cutting through the canopy (illustrative, after Heckenberger's maps;
chip ILLUSTRATIVE). Crane UP to show more rings beyond."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
lane = lambda x, y: any(abs(math.hypot(x - cx, y - cy) - R) < 6 for cx, cy in ((0, 120), (0, 520)) for R in (60, 90, 120)) or abs(x) < 8
jungle(NF, seed=14, n_trees=150, n_palms=30, area=(-320, 320, -40, 700), lane=lane, haze=0.003, under=False)
for cx, cy in ((0, 120), (0, 520)):
    for k, R in enumerate((60, 90, 120)):
        moat_ring('Moat%d_%d' % (cy, k), (cx, cy, 0.3), R, w=9.0)
road = M.principled('Causeway', base=(0.18, 0.13, 0.09), rough=0.95)
boxm('Road', (0, 320, 0.25), (16, 760, 0.3), road)
boxm('Road2', (180, 120, 0.25), (240, 14, 0.3), road)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-140, -180, 160), (0, 220, 0), dz=120, dlook=0), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
