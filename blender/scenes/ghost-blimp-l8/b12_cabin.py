"""s12 MEDIUM 35 mm 'Inside, the radio was on.' Empty gondola interior: two empty seats, control column, the radio's
amber dial lit, daylight through the window strips. Dolly forward through the cabin."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
cabin('Cab', NF)
cam = C.Cam()
wide(cam, NF, C.dolly((0.1, -2.9, 1.45), (0.0, -0.9, 1.4), look=(-0.3, 2.6, 1.0), look1=(-0.4, 1.2, 1.05)), lens=35, fstop=4)
go(cam, NF, a, sc, meter=NF // 2)
