"""s04 MEDIUM 35 mm 'For months, his radio reports had put him far ahead.' Cabin radio set on the chart table, dial
glowing amber, headphones beside it. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = tri_mats()
top = cabin_set(d, lamp=True, day=False)
radio_set('Radio', (-0.2, 1.25, top), d)
torus('Phones', (0.25, 1.05, top + 0.02), 0.08, 0.006, d['iron'], rot=(math.radians(80), 0, 0.3))
paper_stack('Msgs', (0.5, 1.1, top + 0.001), 10, 3, d)
cam = C.Cam()
wide(cam, NF, C.push_in((0.1, -0.9, top + 0.45), (-0.1, 1.2, top + 0.12), amount=0.3), lens=35, fstop=4.0, focus='RadioCase')
go(cam, NF, a, sc, meter=int(NF * 0.6), target=0.2)
