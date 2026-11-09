"""s07 WIDE 28 mm 'No ship reported it. No country claimed it.' Empty black sea to the horizon, starlight on the swell.
Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
night(sea_z=0.0, NF=NF, key=0.14)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.dolly((-30, 0, 8), (30, 0, 8), look=(-20, 4000, 30), look1=(20, 4000, 30)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2, target=0.15)
