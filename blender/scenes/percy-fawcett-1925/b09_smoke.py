"""s09 WIDE 24 mm 'One evening. Two. Five.' Over the canopy at sunset from the village edge: one thin smoke thread far east.
Comp counts 1 / 2 / 5 in a corner chip. Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=9, n_trees=120, n_palms=20, area=(-300, 300, 40, 600), sun_elev=15, az=280, warmth='late', haze=0.003, under=False)
smoke_column('Smoke', (40, 420, 30), NF, n=24, rise=80, spread=10, seed=9)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, -10, 34), (40, 420, 60), amount=0.08), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
