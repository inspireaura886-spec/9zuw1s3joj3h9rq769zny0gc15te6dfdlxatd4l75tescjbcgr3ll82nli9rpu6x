"""s16 WIDE 28 mm LOOP 'For forty-seven years, that stayed the answer. Nobody explained it.' Back on the 1947 press desk;
the move ends on the b02 opening framing (front page + foil), so the loop cuts back to s01/s02 cleanly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(7, 6, 3.0), wood_walls=False, sun_power=1500)
top = desk('Desk', (0, 0.6, 0))
typewriter('Type', (-0.35, 0.75, top), yaw=8)
newspaper('Paper', (0.32, 0.55, top + 0.002), rot=(0, 0, math.radians(-6)))
debris_field((0.05, 0.35, top), radius=0.25, n=8, seed=11, scale=0.25, z=top + 0.004)
telephone('Phone', (0.7, 0.85, top))
cam = C.Cam()
wide(cam, NF, C.dolly((0.4, -2.0, 1.9), (-1.3, -1.2, 1.55), look=(0.3, 0.6, top), look1=(0.05, 0.6, top)), lens=28, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
