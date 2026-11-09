"""s14 CLOSE 35 mm (accent) 'The chronometer case was found empty.' Wooden chronometer box, brass corners, lid open,
velvet recess empty. Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = tri_mats()
top = cabin_set(d, lamp=True, day=False)
chronometer_box('Chrono', (0.0, 1.1, top), d=d)
cam = C.Cam()
wide(cam, NF, C.orbit((0, 1.1, top + 0.1), r=0.6, a0=-120, a1=-80, h=0.35), lens=35, fstop=3.2, focus='ChronoBody')
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
