"""s15 WIDE 24 mm 'His body was never found.' A generic steamer stopped beside the empty trimaran in open sea, camera
rising away."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
day_sea(NF, elev=30, az=210)
trimaran('Electron', (0, 0, 0), yaw_deg=20.0, NF=NF, sails='mizzen')
steamer('Ship', (-60, 30, 0), yaw_deg=10.0, NF=NF, lit=0.0)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.crane((40, -60, 12), (-20, 15, 4), dz=55.0, dlook=-2), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
