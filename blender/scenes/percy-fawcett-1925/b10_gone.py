"""s10 WIDE 24 mm REVEAL 'Then the smoke stopped.' Same horizon, deeper dusk: the smoke thins and is gone by 60 % of the plate.
Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=9, n_trees=120, n_palms=20, area=(-300, 300, 40, 600), sun_elev=15, az=290, warmth='blue', haze=0.004, under=False)
smoke_column('Smoke', (40, 420, 30), NF, n=24, rise=80, spread=10, seed=9, fade_out=(int(NF * 0.2), int(NF * 0.6)))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, -6, 34), (40, 420, 60), amount=0.1), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
