"""s06 WIDE 28 mm TWIST 'But in Fort Worth, General Roger Ramey showed reporters the debris.' Wood-panelled office,
the debris laid on brown paper on the floor (as in the PD 1947 photos), three press cameras on tripods, a desk.
Orbit 70 deg around the debris; flashes pop from 60 percent."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(8, 7, 3.1), wood_walls=True, sun_power=900, seed=6)
desk('Desk', (0, 2.6, 0), w=1.8)
for k in range(3):
    crumple('Wrap%d' % k, (-0.6 + k * 0.6, 0, 0.003), (0.9, 1.2), bpy.data.materials['BrownPaper'], seed=30 + k, amp=0.05)
debris_field((0, 0, 0), radius=1.0, n=40, seed=12, scale=0.5, z=0.01)
for k, (x, y, yaw) in enumerate(((-2.4, -1.8, -40), (0.2, -2.6, 0), (2.5, -1.6, 45))):
    press_camera('Cam%d' % k, (x, y, 0), yaw=yaw, NF=NF, flashes=(int(NF * 0.6) + k * 9,))
cam = C.Cam()
wide(cam, NF, C.orbit((0, 0, 0), r=4.2, a0=-120, a1=-50, h=(2.2, 1.7), look_h=0.1), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 3)
