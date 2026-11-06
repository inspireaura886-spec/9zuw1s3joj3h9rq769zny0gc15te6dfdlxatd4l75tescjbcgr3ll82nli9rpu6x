"""s11 MEDIUM 35 mm 'The next day, Navy Secretary Frank Knox called it a false alarm.' 1942 office desk in daylight:
typed statement in the typewriter, phone, a 'NAVY DEPARTMENT' statement sheet (no invented quotes). Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(6, 5, 3.0), wood_walls=True, sun_power=1300, seed=11)
top = desk('Desk', (0, 0.5, 0))
typewriter('Type', (-0.3, 0.6, top), yaw=-6)
newspaper('Stmt', (0.33, 0.45, top + 0.002), rot=(0, 0, math.radians(8)), size=(0.22, 0.30), headline='STATEMENT', sub='NAVY DEPARTMENT')
telephone('Phone', (0.68, 0.8, top))
cam = C.Cam()
wide(cam, NF, C.push_in((0.9, -1.4, 1.5), (0.1, 0.55, top), amount=0.3), lens=35, fstop=4)
go(cam, NF, a, sc, meter=NF // 2)
