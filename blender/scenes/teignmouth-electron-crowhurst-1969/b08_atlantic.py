"""s08 WIDE 24 mm 'He never left the Atlantic.' Aerial: the tiny trimaran on an endless ocean, camera rising high."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
day_sea(NF, elev=40, az=200)
trimaran('Electron', (0, 0, 0), yaw_deg=60.0, NF=NF, sails='full')
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.crane((-30, -40, 25), (0, 0, 0), dz=90.0, dlook=0), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
