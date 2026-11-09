"""s05 MEDIUM 35 mm 'Newspapers said he might win.' A stack of newspapers on a harbour office table in daylight
(no real mastheads; headline chip in comp). Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
d = tri_mats()
wall = M.principled('OfficeWall', base=(0.55, 0.53, 0.46), rough=0.85)
room_shell(4.0, 4.0, 2.6, (0, 0.5, 0), wall, wood_floor('OfficeFloor'), M.principled('OfficeCeil', base=(0.6, 0.6, 0.56), rough=0.9), open_side='WFront')
Wd.hdri('kloppenheim_02_puresky', strength=0.2, bg_strength=0.2)
boxm('Table', (0, 0.9, 0.74), (1.6, 1.0, 0.05), d['wood_l'], 0.01)
newspapers('News', (0, 0.9, 0.77), n=7, d=d)
Wd.area('Window', (1.8, 1.2, 1.8), (0, 0.9, 0.77), color=(1.0, 0.96, 0.9), power=400, size=1.2)
cam = C.Cam()
wide(cam, NF, C.orbit((0, 0.9, 0.78), r=1.4, a0=-110, a1=-80, h=0.9), lens=35, fstop=5.6, focus=Vector((0, 0.9, 0.78)))
go(cam, NF, a, sc, meter=NF // 2)
