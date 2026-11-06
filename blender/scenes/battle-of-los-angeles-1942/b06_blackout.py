"""s06 WIDE 24 mm 'Sirens. Blackout.' The LA basin's lights go out district by district (20-85 percent),
night sky and hills behind. Crane UP from 200 m to 800 m."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
la_night(NF, moon=0.4, seed=2, blackout=(int(NF * 0.2), int(NF * 0.85)))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((0, -2000, 200), (0, 7000, 0), dz=600, dlook=-200), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 8)
