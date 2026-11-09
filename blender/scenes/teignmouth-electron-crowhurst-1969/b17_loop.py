"""s17 WIDE 28 mm 'Nobody explained it.' LOOP: the trimaran drifting alone, same framing as s02 (dissolves into s01).
Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
day_sea(NF, elev=38, az=230)
trimaran('Electron', (0, 0, 0), yaw_deg=20.0, NF=NF, sails='mizzen')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((26, 30, 5.0), (0, 0, 2.5), amount=0.12), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
