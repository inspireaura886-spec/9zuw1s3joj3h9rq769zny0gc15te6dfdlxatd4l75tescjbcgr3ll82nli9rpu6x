"""s05 MEDIUM 35 mm 'a flying disc, recovered.' Teletype printer feeding paper in the base press office, desk lamp,
phone; window light. Lateral dolly R->L past the printer."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(5, 5, 2.9), wood_walls=False, sun_power=1100, seed=2)
top = desk('Desk', (0.9, 0.9, 0))
teletype('TTY', (-0.4, 1.2, 0), NF)
telephone('Phone', (0.7, 1.0, top))
CN.place('desk_lamp_arm_01', (1.3, 1.1, top), rot=(0, 0, math.radians(200)))
Wd.spot('LampKey', (1.1, 0.8, 1.6), (-0.3, 1.2, 1.0), color=(1.0, 0.82, 0.6), power=120, size_deg=60, blend=0.6)
cam = C.Cam()
wide(cam, NF, C.dolly((0.9, -1.1, 1.35), (-0.5, -1.0, 1.3), look=(-0.2, 1.2, 1.05), look1=(-0.4, 1.2, 1.1)), lens=35, fstop=4)
go(cam, NF, a, sc, meter=NF // 2)
