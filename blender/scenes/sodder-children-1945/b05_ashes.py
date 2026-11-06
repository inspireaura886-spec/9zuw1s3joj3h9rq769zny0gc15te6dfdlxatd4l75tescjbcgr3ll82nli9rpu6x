"""s05 MEDIUM 30 mm TWIST 'his men found no bones in the ashes.' Inside the basement pit: grey ash, charred joists, two
shovels standing in it, the stove's iron shape; nothing else. Lateral dolly at shoulder height."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
sod_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.25, bg_strength=0.45, tint=(0.8, 0.85, 0.9))
CN.sun(elev=16, az=150, warmth='noon', strength=1.2)
ash = M.principled('AshT', base=(0.30, 0.29, 0.28), rough=1.0, bump=0.6, bump_scale=25)
Wd.terrain('AshBed', size=12, res=60, height=0.3, scale=0.6, center=(0, 0, -1.2), seed=5, mat=ash)
for sx in (-5.3, 5.3):
    boxm('Wall%d' % int(sx), (sx, 0, -0.6), (0.4, 9, 1.6), M.principled('Stone', base=(0.35, 0.33, 0.3), rough=0.9, grime=0.6))
for k in range(7):
    j = cyl('Joist%d' % k, (-4 + 1.2 * k, -3, -1.0 + 0.1 * (k % 2)), (-3.2 + 1.2 * k, 3, -0.8), 0.09, bpy.data.materials['Char'], 6)
for k, x in enumerate((-1.5, 1.8)):
    cyl('Shovel%d' % k, (x, 0.5, -1.3), (x + 0.2, 0.6, 0.1), 0.02, M.principled('Handle', base=(0.35, 0.25, 0.15), rough=0.7), 8)
    boxm('Blade%d' % k, (x, 0.5, -1.3), (0.25, 0.03, 0.3), M.principled('Iron', base=(0.2, 0.2, 0.2), rough=0.5, metal=0.8, grime=0.6))
boxm('Stove', (2.8, 2.0, -0.8), (0.9, 0.7, 0.8), M.principled('StoveI', base=(0.08, 0.08, 0.08), rough=0.6, metal=0.6, grime=0.7))
dust((0, 0, -0.2), (8, 6, 2), n=300, seed=5, color=(0.8, 0.8, 0.8), strength=0.15)
cam = C.Cam(clip_end=600)
wide(cam, NF, C.dolly((-3.5, -6.5, 1.0), (0.5, -6.5, 1.0), look=(-1.5, 1, -1.1), look1=(2, 1, -1.1)), lens=30, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
