"""s11 MEDIUM 35 mm 'Then his final pages turned into twenty-five thousand words of strange philosophy.' Cabin table
buried in handwritten loose pages under the lamp. Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = tri_mats()
top = cabin_set(d, lamp=True, day=False)
loose_pages('Pg', (0.0, 1.1, top + 0.002), n=46, area=(1.2, 0.55), seed=8, d=d)
logbook('LogOpen', (0.1, 1.05, top + 0.06), rot_z=-0.1, open_=True, d=d)
cam = C.Cam()
wide(cam, NF, C.orbit((0, 1.1, top), r=1.0, a0=-120, a1=-70, h=0.7), lens=35, fstop=4.5, focus=Vector((0.1, 1.05, top)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
