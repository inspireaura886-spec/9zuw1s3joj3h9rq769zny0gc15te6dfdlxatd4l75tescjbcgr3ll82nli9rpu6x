"""s02 WIDE 24 mm 'Officially, five of the Sodder children died inside.' The farmhouse at night before the fire: warm windows,
Christmas lights along the eaves, frosted field, stars. No figures. Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
winter_night(NF, seed=2)
house('House', (0, 0, 0), lit=True, xmas=True)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((-8, -34, 2.0), (0, 0, 4.0), amount=0.15), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
