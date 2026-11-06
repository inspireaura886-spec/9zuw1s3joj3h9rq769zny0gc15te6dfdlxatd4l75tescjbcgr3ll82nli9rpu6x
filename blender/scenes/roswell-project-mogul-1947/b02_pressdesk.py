"""s02 WIDE 28 mm 'A day later, it took that back.' 1947 newsroom desk: typewriter, recreated front page, foil scraps,
blind-slat sun. Eased dolly L->R across the desk; ends where b16 starts (loop pair)."""
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
wide(cam, NF, C.dolly((-1.3, -1.2, 1.55), (-0.6, -1.25, 1.5), look=(0.05, 0.6, top), look1=(0.25, 0.55, top)), lens=28, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
