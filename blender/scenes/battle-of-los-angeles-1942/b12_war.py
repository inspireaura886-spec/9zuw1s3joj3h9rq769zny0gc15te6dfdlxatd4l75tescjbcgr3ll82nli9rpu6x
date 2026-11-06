"""s12 WIDE 28 mm 'The Secretary of War said up to fifteen planes had flown over.' War Department office: a big wall
map board of the coast with grid and pins, desk, window light. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(9, 7, 3.4), wood_walls=True, sun_power=1500, seed=12)
desk('Desk', (0, 1.2, 0), w=2.0, d=0.9)
board = boxm('MapBoard', (0, 3.38, 1.8), (5.5, 0.05, 2.4), M.principled('MapPaper', base=(0.72, 0.70, 0.60), rough=0.9, grime=0.3))
sea = boxm('MapSea', (-1.2, 3.35, 1.8), (3.0, 0.01, 2.3), M.principled('MapSeaM', base=(0.45, 0.55, 0.62), rough=0.9))
ink = M.principled('MapInk', base=(0.15, 0.15, 0.15), rough=0.8)
for k in range(9):
    boxm('GridV%d' % k, (-2.6 + k * 0.65, 3.34, 1.8), (0.008, 0.005, 2.3), ink)
for k in range(5):
    boxm('GridH%d' % k, (0, 3.34, 0.75 + k * 0.52), (5.4, 0.005, 0.008), ink)
pin = M.principled('Pin', base=(0.2, 0.25, 0.45), rough=0.4)
for k in range(15):
    sphere('Pin%d' % k, (-0.6 + (k % 5) * 0.12, 3.32, 1.9 + (k // 5) * 0.1), 0.02, pin, 8)
cam = C.Cam()
wide(cam, NF, C.dolly((-2.2, -2.2, 1.7), (1.0, -2.3, 1.65), look=(-0.4, 3.3, 1.6), look1=(0.2, 3.3, 1.6)), lens=28, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
