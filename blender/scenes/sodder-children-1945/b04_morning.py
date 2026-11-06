"""s04 WIDE 28 mm 'But that morning, the fire chief had told the family' Grey Christmas morning: a smoking basement pit where the
house stood, a 1940s fire truck, three faceless adult firemen. Crane DOWN."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
sod_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.25, bg_strength=0.45, tint=(0.8, 0.85, 0.9))
CN.sun(elev=15, az=150, warmth='noon', strength=1.2)
Wd.terrain('Field', size=400, res=80, height=1.2, scale=0.02, center=(0, 40, -0.2), seed=4, mat=bpy.data.materials['Frost'])
CN.scatter('pine_tree_01', 40, (-120, 120, 60, 140), seed=7, scale=(0.9, 1.4))
boxm('Pit', (0, 0, -0.6), (10.5, 8.5, 1.4), bpy.data.materials['Ash'])
for k in range(6):
    crumple('Beam%d' % k, (-4 + 1.6 * k, (k % 3) - 1, 0.2), 1.4, bpy.data.materials['Char'], seed=k, amp=0.5)
cyl('Chimney', (4.2, 3.0, -0.5), (4.2, 3.0, 7.5), 0.55, M.principled('Brick', base=(0.35, 0.16, 0.10), rough=0.85, grime=0.6), 4)
sm = fade_mat('Smolder', base=(0.4, 0.4, 0.42), rough=1.0)
key_fac(sm, [(0, 0.35)])
for k in range(10):
    p0 = Vector((-3 + 0.7 * k, 0, 0.5 + 1.8 * k))
    o = crumple('Puff%d' % k, p0, 1.0 + 0.4 * k, sm, seed=k, amp=0.4)
    key_loc(o, [(0, p0), (NF, p0 + Vector((2, 0, 4)))], interp='LINEAR')
truck('Engine', (-12, -8, 0), yaw=30)
bpy.data.materials['TruckP'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.35, 0.03, 0.02, 1)
for k in range(3):
    figure('Fireman%d' % k, (-6 + 2.2 * k, -6.5, 0), yaw=10 * k, coat=M.principled('Coat%d' % k, base=(0.05, 0.05, 0.05), rough=0.6))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-16, -26, 12), (0, 0, 0), dz=-8, dlook=0), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
