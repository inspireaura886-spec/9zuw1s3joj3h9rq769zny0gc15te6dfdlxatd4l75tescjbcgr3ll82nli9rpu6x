"""s02 WIDE 24 mm 'to find a lost city he called Z.' Aerial over endless canopy, a brown river bending through it, golden
haze. Crane DOWN toward the treetops."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=1, n_trees=110, n_palms=24, area=(-260, 260, -60, 520), lane=lambda x, y: on_river(x, y, 30, 18), haze=0.004, under=False)
river('River', -80, 560, width=30, bend=18)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-60, -160, 190), (10, 260, 10), dz=-70, dlook=0), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2, target=0.30)
