"""s09 MEDIUM 35 mm 'In Stockholm, ninety-three photos were saved.' A 1930 darkroom under an amber safelight: developing
trays, an enlarger, film strips hanging to dry (chip '93 OF 240 FRAMES'). Dolly along the bench."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
room(size=(4, 4, 2.6), wood_walls=False, window=False, seed=9)
top = desk('Bench', (0, 0.9, 0), w=2.4, d=0.8, h=0.9)
tray = M.principled('Tray', base=(0.75, 0.74, 0.70), rough=0.3, coat=0.5)
liquid = M.principled('Dev', base=(0.03, 0.025, 0.02), rough=0.02)
for k in range(3):
    boxm('Tray%d' % k, (-0.7 + k * 0.6, 0.85, top + 0.03), (0.45, 0.35, 0.06), tray, 0.01)
    boxm('Liq%d' % k, (-0.7 + k * 0.6, 0.85, top + 0.055), (0.41, 0.31, 0.005), liquid)
cyl('EnlCol', (0.95, 1.15, top), (0.95, 1.15, top + 0.9), 0.03, bpy.data.materials['Chrome'], 10)
boxm('EnlHead', (0.95, 1.0, top + 0.75), (0.22, 0.3, 0.25), bpy.data.materials['BlackEnamel'], 0.02)
sag_rope('DryLine', (-1.6, 0.4, 2.05), (1.6, 0.4, 2.05), sag=0.05, r=0.004, mat=bpy.data.materials['Ink'])
film = M.principled('Film', base=(0.10, 0.08, 0.06), rough=0.2, alpha=0.9)
frame_m = M.principled('FrameM', base=(0.45, 0.40, 0.33), rough=0.3)
for k in range(9):
    x = -1.4 + k * 0.33
    boxm('Strip%d' % k, (x, 0.4, 1.6), (0.035, 0.002, 0.85), film)
    for j in range(6):
        boxm('Fr%d_%d' % (k, j), (x, 0.398, 1.25 + j * 0.13), (0.026, 0.001, 0.09), frame_m)
sphere('SafeBulb', (0, 1.25, 2.3), 0.07, M.emission('SafeM', (1.0, 0.55, 0.18), 30.0), 16)
Wd.point('Safelight', (0, 1.2, 2.25), color=(1.0, 0.55, 0.18), power=40, radius=0.08)
cam = C.Cam()
wide(cam, NF, C.dolly((-1.2, -1.2, 1.55), (0.4, -1.25, 1.5), look=(-0.4, 0.6, 1.3), look1=(0.3, 0.6, 1.25)), lens=35, fstop=4)
go(cam, NF, a, sc, meter=NF // 2, target=0.16)
