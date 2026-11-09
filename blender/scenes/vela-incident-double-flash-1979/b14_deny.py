"""s14 WIDE 24 mm 'Neither country has ever admitted it.' Night ocean, the flash point now dark; camera rises away."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
night(sea_z=0.0, NF=NF, key=0.1)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.crane((0, -100, 40), (0, 9000, 40), dz=600.0, dlook=-20), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2, target=0.15)
