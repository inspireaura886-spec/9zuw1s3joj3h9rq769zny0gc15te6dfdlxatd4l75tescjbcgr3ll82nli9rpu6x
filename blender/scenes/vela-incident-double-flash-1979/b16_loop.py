"""s16 WIDE 24 mm 'Nobody explained it.' LOOP: same night horizon as s02, black and still (dissolves into s01). Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
night(sea_z=0.0, NF=NF, key=0.06)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.push_in((0, -200, 900), (0, 9000, 40), amount=0.05), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2, target=0.15)
