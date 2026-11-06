"""s13 WIDE 28 mm 'A model of the sky, in a case about the size of a shoebox.' A long workshop table under one lamp, the
small wooden case alone in the middle, an oil lamp and scrolls for scale (chip ~34 x 18 x 9 CM, SIZE UNCERTAIN). Orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
anti_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.03, bg_strength=0.0)
boxm('Floor', (0, 0, -0.02), (8, 8, 0.04), M.texture_set('Flag', 'rough_concrete', scale=0.5, tint=(0.5, 0.45, 0.4)))
boxm('Table', (0, 0, 0.74), (2.4, 1.0, 0.05), M.texture_set('TableW', 'wood_table_worn', scale=1.0, tint=(0.35, 0.24, 0.15)))
mechanism('Mech', (0, 0, 0.765), scale=1.0)
CN.place('vintage_oil_lamp', (0.7, 0.2, 0.765), scale=1.0)
for k in range(3):
    cyl('Scroll%d' % k, (-0.8, -0.2 + k * 0.08, 0.79), (-0.5, -0.2 + k * 0.08, 0.79), 0.025,
        M.principled('Papyrus', base=(0.75, 0.66, 0.48), rough=0.9), 16)
Wd.point('LampGlow', (0.7, 0.2, 1.0), color=(1.0, 0.7, 0.4), power=60, radius=0.05)
Wd.fog(center=(0, 0, 1.4), size=(6, 6, 2.8), density=0.03, color=(1.0, 0.9, 0.78), anisotropy=0.6)
cam = C.Cam(clip_end=100)
wide(cam, NF, C.orbit((0, 0, 0.8), r=2.6, a0=-120, a1=-95, h=(0.9, 0.7), look_h=0.05), lens=28, fstop=5.6, focus='Mech')
go(cam, NF, a, sc, meter=NF // 2)
