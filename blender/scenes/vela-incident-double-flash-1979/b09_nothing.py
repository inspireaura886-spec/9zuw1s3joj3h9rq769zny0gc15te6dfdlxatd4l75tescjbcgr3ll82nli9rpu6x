"""s09 MEDIUM 35 mm 'They found no fallout.' REVEAL: a clean white filter pad on a steel lab tray under a lamp. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = mats()
top = desk_lamp_set(d)
boxm('Tray', (0, 0.85, top + 0.01), (0.5, 0.36, 0.02), M.principled('Steel', base=(0.6, 0.6, 0.62), rough=0.3, metal=1.0), 0.004)
cyl('Filter', (0, 0.85, top + 0.021), (0, 0.85, top + 0.026), 0.11, M.principled('FilterM', base=(0.85, 0.85, 0.82), rough=0.95), 48)
cyl('Tweezer', (0.16, 0.7, top + 0.024), (0.3, 0.82, top + 0.024), 0.003, M.principled('Tw', base=(0.7, 0.7, 0.72), rough=0.2, metal=1.0), 6)
cam = C.Cam()
wide(cam, NF, C.push_in((0.0, 0.2, top + 0.45), (0, 0.85, top + 0.02), amount=0.3), lens=35, fstop=4.0, focus='Filter')
go(cam, NF, a, sc, meter=int(NF * 0.6), target=0.2)
