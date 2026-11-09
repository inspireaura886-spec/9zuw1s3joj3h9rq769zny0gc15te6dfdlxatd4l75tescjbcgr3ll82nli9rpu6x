"""s13 CLOSE 35 mm (accent) 'President Carter wrote in his diary that his scientists believed Israel did it.' A closed
leather diary and a pen on a desk in the lamp pool, no text (chip 27 FEB 1980). Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = mats()
top = desk_lamp_set(d)
diary = M.principled('Diary', base=(0.16, 0.06, 0.04), rough=0.55, grime=0.3, bump=0.25, bump_scale=90)
boxm('DiaryCov', (0, 0.85, top + 0.022), (0.2, 0.27, 0.04), diary, 0.004)
boxm('DiaryPg', (0.004, 0.85, top + 0.022), (0.19, 0.26, 0.036), d['paper'])
cyl('Pen', (0.13, 0.75, top + 0.008), (0.16, 0.95, top + 0.008), 0.006, d['iron'], 10)
cam = C.Cam()
wide(cam, NF, C.push_in((-0.1, 0.35, top + 0.35), (0, 0.85, top + 0.03), amount=0.25), lens=35, fstop=2.8, focus='DiaryCov')
go(cam, NF, a, sc, meter=int(NF * 0.6), target=0.2)
