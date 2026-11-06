"""s13 CLOSE 45 mm (accent) 'The life raft was still aboard.' The rolled yellow life raft strapped in its rack. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
cabin('Cab', NF)
cam = C.Cam()
wide(cam, NF, C.push_in((-0.35, -0.1, 1.25), (0.55, -1.1, 0.5), amount=0.3), lens=45, fstop=2.8, focus=Vector((0.55, -1.1, 0.5)))
go(cam, NF, a, sc, meter=NF // 2)
