"""s06 MEDIUM 35 mm 'But look at what the pictures show.' A glossy print of the row of lights on a desk under a
lamp, a magnifying glass on it. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
desert_mats()
Wd.hdri('qwantani_night_puresky', strength=0.05, bg_strength=0.0)
boxm('Desk', (0, 0, 0.72), (1.6, 0.9, 0.04), M.texture_set('DeskW', 'wood_table_worn', scale=1.0, tint=(0.4, 0.27, 0.16)))
boxm('Print', (0, 0, 0.745), (0.30, 0.20, 0.002), M.principled('PrintBlack', base=(0.015, 0.015, 0.02), rough=0.2, coat=0.6))
for k in range(8):
    sphere('Dot%d' % k, (-0.12 + k * 0.034, 0.03 + (k % 3) * 0.004, 0.747), 0.004, glow_mat('DotM%d' % k, color=(1.0, 0.8, 0.5),
           strength=8.0), 8)
boxm('Ridge', (0, -0.04, 0.7465), (0.30, 0.04, 0.001), M.principled('PrintRidge', base=(0.002, 0.002, 0.002), rough=0.3))
CN.place('magnifying_glass_01', (0.12, -0.02, 0.745), rot=(0, 0, 0.6), scale=0.8)
Wd.spot('Lamp', (0.4, 0.3, 1.4), (0, 0, 0.74), color=(1.0, 0.8, 0.55), power=120, size_deg=55)
cam = C.Cam(clip_end=100)
wide(cam, NF, C.push_in((0, -0.7, 1.25), (0, 0, 0.745), amount=0.3), lens=35, fstop=4, focus=Vector((0, 0, 0.745)))
go(cam, NF, a, sc, meter=NF // 2)
