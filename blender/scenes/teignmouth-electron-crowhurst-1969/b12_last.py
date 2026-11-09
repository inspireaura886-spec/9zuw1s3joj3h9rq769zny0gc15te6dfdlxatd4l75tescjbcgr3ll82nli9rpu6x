"""s12 MEDIUM 35 mm 'The last entry, on July first, ended with four words.' The open logbook at its last written page
under the lamp. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = tri_mats()
top = cabin_set(d, lamp=True, day=False)
logbook('LogLast', (0.0, 1.1, top), rot_z=0.0, open_=True, d=d, w=0.26, h=0.34)
cam = C.Cam()
wide(cam, NF, C.push_in((0.0, 0.35, top + 0.55), (0.0, 1.1, top), amount=0.3), lens=35, fstop=4.0, focus=Vector((0, 1.1, top)))
go(cam, NF, a, sc, meter=int(NF * 0.6), target=0.2)
