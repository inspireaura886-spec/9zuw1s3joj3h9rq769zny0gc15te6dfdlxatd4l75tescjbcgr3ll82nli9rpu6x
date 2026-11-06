"""s05 WIDE 28 mm 'and a lump of bronze and wood.' On the seabed: broken ship planks and, between them, the crusted lump,
a diver's hand-net beside it. Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
seabed(NF, seed=4, area=60)
for k in range(7):
    p = boxm('Plank%d' % k, (-1.2 + k * 0.42, 6 + (k % 2) * 0.3, 0.12), (0.3, 3.2, 0.08), bpy.data.materials['CaseWood'])
    p.rotation_euler = (0, math.radians((k * 7) % 12), math.radians(8 + k * 3))
lump('FragA', (0.2, 5.0, 0.2), size=(0.34, 0.22, 0.12), seed=4)
amphora('AmphA', (-1.5, 4.0, 0.15), rot=(math.radians(85), 0, 0.4))
cam = C.Cam(clip_end=300)
wide(cam, NF, C.orbit((0.2, 5.0, 0.2), r=4.2, a0=-120, a1=-90, h=(1.6, 1.2), look_h=0.1), lens=28, fstop=5.6, focus='FragA')
go(cam, NF, a, sc, meter=NF // 2)
