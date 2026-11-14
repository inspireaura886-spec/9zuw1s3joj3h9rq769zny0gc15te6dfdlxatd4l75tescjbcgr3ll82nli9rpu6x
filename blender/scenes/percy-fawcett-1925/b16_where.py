"""s16 WIDE 24 mm 'So where did the three men go?' An empty trail into dark forest, last blue light, faint haze. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=16, n_trees=90, n_palms=14, area=(-70, 70, -10, 200), lane=lambda x, y: abs(x - 1.5 * math.sin(y * 0.06)) < 3.0, sun_elev=18, az=300, warmth='blue', haze=0.012)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, -4, 1.7), (0, 60, 2.0), amount=0.2), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2, target=0.28)
