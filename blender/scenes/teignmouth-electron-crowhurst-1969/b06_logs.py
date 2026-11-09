"""s06 CLOSE 35 mm (accent) 'But his logbooks were still on board.' TWIST: two closed logbooks on the cabin chart table in
a shaft of daylight from the port light. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = tri_mats()
top = cabin_set(d, lamp=False, day=True)
logbook('LogA', (-0.12, 1.1, top), rot_z=0.15, open_=False, d=d)
logbook('LogB', (0.18, 1.15, top + 0.04), rot_z=-0.2, open_=False, d=d)
cam = C.Cam()
wide(cam, NF, C.push_in((0.15, 0.2, top + 0.5), (0.02, 1.12, top + 0.03), amount=0.3), lens=35, fstop=2.8, focus='LogACov')
go(cam, NF, a, sc, meter=int(NF * 0.6), target=0.2)
