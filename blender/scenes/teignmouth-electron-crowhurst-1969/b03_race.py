"""s03 WIDE 28 mm 'It was the Teignmouth Electron, sailed alone by Donald Crowhurst in a race around the world.'
Trimaran under full sail in golden light, one faceless sailor at the tiller. Lateral dolly alongside."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
day_sea(NF, elev=14, az=250, warmth='golden', hdri='industrial_sunset_02', strength=3.0)
trimaran('Electron', (0, 0, 0), yaw_deg=0.0, NF=NF, sails='full', sailor=True)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-30, -14, 3.0), (-30, 6, 3.0), look=(0, -4, 4), look1=(0, 6, 4.5)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
