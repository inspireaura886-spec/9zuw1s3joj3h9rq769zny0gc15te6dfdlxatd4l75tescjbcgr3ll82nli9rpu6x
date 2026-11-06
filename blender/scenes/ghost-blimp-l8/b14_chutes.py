"""s14 MEDIUM 35 mm 'So were all three parachutes.' Three parachute packs hanging in a row by the door. Orbit 40 deg."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
cabin('Cab', NF)
cam = C.Cam()
wide(cam, NF, C.orbit((-0.75, -2.38, 1.25), r=1.15, a0=-25, a1=15, h=0.15, look_h=0.0), lens=35, fstop=4, focus=Vector((-0.75, -2.38, 1.25)))
go(cam, NF, a, sc, meter=NF // 2)
