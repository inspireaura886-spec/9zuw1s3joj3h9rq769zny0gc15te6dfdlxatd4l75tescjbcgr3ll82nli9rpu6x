"""s02 WIDE 28 mm 'Nobody was aboard.' HOOK: the trimaran drifts on a calm blue Atlantic, mizzen up, deck empty.
Slow push-in from off the starboard bow."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
day_sea(NF, elev=38, az=230)
trimaran('Electron', (0, 0, 0), yaw_deg=20.0, NF=NF, sails='mizzen')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((22, 26, 4.5), (0, 0, 2.5), amount=0.18), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
