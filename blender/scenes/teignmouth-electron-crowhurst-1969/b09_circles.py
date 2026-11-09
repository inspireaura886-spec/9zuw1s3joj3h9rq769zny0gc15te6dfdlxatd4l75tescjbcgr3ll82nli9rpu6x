"""s09 WIDE 28 mm 'For seven months, he wandered the South Atlantic and radioed fake positions.' Night: the trimaran with
a warm cabin glow under stars, aerial wire up the mast (comp draws the looping track). Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
night(sea_z=0.0, NF=NF, key=0.14)
d = tri_mats()
trimaran('Electron', (0, 0, 0), yaw_deg=-30.0, NF=NF, sails='mizzen', lit=True, d=d)
Wd.point('CabinGlow', (0, -0.6, 1.6), color=(1.0, 0.7, 0.4), power=60, radius=0.3)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-26, -18, 3.0), (-18, -26, 3.0), look=(0, 0, 3.0), look1=(0, -1, 3.0)), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
