"""s13 CLOSE 35 mm (accent) 'It is the mercy.' REVEAL: a pencil lying across the last page (comp types the words). Very
slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = tri_mats()
top = cabin_set(d, lamp=True, day=False)
logbook('LogLast', (0.0, 1.1, top), rot_z=0.0, open_=True, d=d, w=0.26, h=0.34)
cyl('Pencil', (0.06, 1.02, top + 0.026), (0.2, 1.16, top + 0.026), 0.004, M.principled('PencilM', base=(0.55, 0.42, 0.12), rough=0.5), 6)
cam = C.Cam()
wide(cam, NF, C.push_in((0.05, 0.75, top + 0.32), (0.1, 1.08, top + 0.02), amount=0.18), lens=35, fstop=2.8, focus=Vector((0.1, 1.08, top + 0.02)))
go(cam, NF, a, sc, meter=int(NF * 0.6), target=0.2)
