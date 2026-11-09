"""s16 WIDE 28 mm 'So what happened on that empty deck?' The empty deck from the stern quarter, sail slack, cockpit
empty. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
day_sea(NF, elev=24, az=160)
trimaran('Electron', (0, 0, 0), yaw_deg=0.0, NF=NF, sails='mizzen')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-4.0, -11.0, 3.4), (2.5, -11.0, 3.4), look=(0, -1, 1.4), look1=(0, 0, 1.6)), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
