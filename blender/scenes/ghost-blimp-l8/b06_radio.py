"""s06 CLOSE 45 mm (accent) 'No distress call came.' The gondola radio set: amber dial glow, knobs, the headset on its hook.
Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
cabin('Cab', NF)
cam = C.Cam()
wide(cam, NF, C.push_in((0.25, 0.2, 1.4), (-0.49, 1.05, 1.12), amount=0.3), lens=45, fstop=2.8, focus=Vector((-0.49, 1.0, 1.12)))
go(cam, NF, a, sc, meter=NF // 2)
