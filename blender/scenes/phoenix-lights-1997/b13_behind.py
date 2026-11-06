"""s13 WIDE 24 mm REVEAL 'They weren't over Phoenix. They were behind the ridge, fifty miles or more away.' High aerial:
the city grid in the foreground, the black ridge, and far beyond it the row of flares over empty desert. Crane UP."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=10)
Wd.terrain('Range', size=40000, res=140, height=60, scale=0.0008, center=(0, 34000, -4), seed=10,
           mat=bpy.data.materials['DesertRock'])
flare_row(NF, base=(0, 30000, 0), n=8, gap=1100, alt=1600, fall=1.0)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.crane((-3000, -6000, 2500), (0, 20000, 800), dz=1800, dlook=0), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
