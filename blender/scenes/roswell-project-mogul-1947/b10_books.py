"""s10 MEDIUM 35 mm 'Later books added alien bodies.' Paperbacks with blank muted covers on a side table under an oil
lamp (no alien art, by rule). Orbit 50 deg."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(5, 5, 2.8), wood_walls=True, window=False, seed=10)
top = desk('Side', (0, 0, 0), w=1.0, d=0.7, h=0.6)
books('Stack', (0, 0, top), n=9)
books('Stack2', (0.32, 0.1, top), n=4, seed=7)
CN.place('vintage_oil_lamp', (-0.32, 0.12, top))
Wd.spot('Key', (-0.6, -0.3, 1.6), (0, 0, top), color=(1.0, 0.8, 0.55), power=140, size_deg=40, blend=0.7)
cam = C.Cam()
wide(cam, NF, C.orbit((0, 0, top + 0.12), r=1.35, a0=-110, a1=-60, h=0.35, look_h=0.0), lens=35, fstop=4, focus='Stack')
go(cam, NF, a, sc, meter=NF // 2)
