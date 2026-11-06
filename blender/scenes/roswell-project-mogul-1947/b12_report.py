"""s12 MEDIUM 35 mm 'Its nineteen ninety-four report named Project Mogul, most likely:' Blue Air Force report binder on
a desk opens (cover swings 25-75 percent of the plate); lamp light, glasses. Crane DOWN over the desk."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(5, 5, 2.8), wood_walls=False, sun_power=800, seed=12)
top = desk('Desk', (0, 0.3, 0))
binder('Report', (0, 0.25, top), NF)
CN.place('round_spectacles', (0.32, 0.1, top), rot=(0, 0, 2.0))
CN.place('stationery_supplies', (-0.55, 0.45, top))
Wd.spot('Key', (-0.5, -0.2, 1.8), (0, 0.25, top), color=(1.0, 0.9, 0.75), power=150, size_deg=45, blend=0.7)
cam = C.Cam()
wide(cam, NF, C.crane((0.1, -0.55, top + 0.95), (0, 0.25, top), dz=-0.35), lens=35, fstop=4, focus='Report')
go(cam, NF, a, sc, meter=int(NF * 0.8))
