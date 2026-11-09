"""s07 MEDIUM 35 mm 'They told a different story.' An open logbook, pencil rule lines, beside a chart with a pencil
track. Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = tri_mats()
top = cabin_set(d, lamp=True, day=True)
logbook('LogOpen', (-0.15, 1.1, top), rot_z=0.1, open_=True, d=d)
boxm('Chart', (0.35, 1.15, top + 0.001), (0.6, 0.5, 0.002), M.principled('ChartM', base=(0.7, 0.68, 0.58), rough=0.85))
curve_poly('Track', [(0.12, 1.0, top + 0.004), (0.25, 1.2, top + 0.004), (0.4, 1.05, top + 0.004), (0.55, 1.3, top + 0.004)], 0.002, d['ink'])
cam = C.Cam()
wide(cam, NF, C.orbit((0.05, 1.12, top), r=0.8, a0=-115, a1=-75, h=0.55), lens=35, fstop=4.0, focus=Vector((-0.1, 1.1, top)))
go(cam, NF, a, sc, meter=NF // 2, target=0.21)
