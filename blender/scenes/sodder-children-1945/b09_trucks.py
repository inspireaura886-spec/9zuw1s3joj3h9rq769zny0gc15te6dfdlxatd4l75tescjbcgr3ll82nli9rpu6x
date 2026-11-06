"""s09 WIDE 28 mm 'Both his trucks, fine the day before, would not start.' Two 1940s work trucks in the frosted yard, dead
headlights, the fire's glow moving on their paint. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
winter_night(NF, seed=9, moon=0.15)
house('House', (0, 18, 0), lit=True, xmas=False)
fire('Fire', (0, 18, 4.5), (9, 7, 6), NF, seed=9)
truck('Truck1', (-4, 0, 0), yaw=-20)
truck('Truck2', (3.5, -1.5, 0), yaw=15)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((-2, -16, 1.5), (0, 2, 1.2), amount=0.2), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
