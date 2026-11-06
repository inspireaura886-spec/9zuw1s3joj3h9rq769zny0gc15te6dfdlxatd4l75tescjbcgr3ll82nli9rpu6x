"""s05 WIDE 28 mm 'His last letter came from Dead Horse Camp.' Dusk clearing: canvas tent, packs, a small fire, two porters
leading mules away down the trail, a scatter of white stones (never a skeleton). Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=5, n_trees=55, n_palms=10, area=(-90, 90, -40, 140), lane=lambda x, y: x * x + y * y < 30 * 30, sun_elev=15, az=230, warmth='late', haze=0.01)
tentc = M.principled('TentC', base=(0.55, 0.50, 0.40), rough=0.9, grime=0.3)
Md.mesh_obj('Tent', [(-1.1, -1.5, 0), (1.1, -1.5, 0), (0, -1.5, 1.6), (-1.1, 1.5, 0), (1.1, 1.5, 0), (0, 1.5, 1.6)],
            [(0, 1, 2), (3, 5, 4), (0, 2, 5, 3), (1, 4, 5, 2)], smooth=False, mats=(tentc,))
campfire('Fire', (3.2, -2.5, 0), NF, power=500)
for k in range(3):
    boxm('Pack%d' % k, (-2.0 + 0.6 * k, -2.6, 0.25), (0.45, 0.3, 0.5), bpy.data.materials['Canvas'], bev=0.04)
r = rng(5)
for k in range(9):
    crumple('Stone%d' % k, (6 + r.uniform(-1.5, 1.5), 3 + r.uniform(-1, 1), 0.05), 0.25, bpy.data.materials['Bone'], seed=k, amp=0.3)
for k in range(2):
    p = walker('Porter%d' % k, (-4 - 1.2 * k, 12, 0), yaw=180, pack=False)
    walk(p, NF, (-4 - 1.2 * k, 12, 0), (-4 - 1.2 * k, 20, 0))
    mule = boxm('Mule%d' % k, (-4.6 - 1.2 * k, 13.5, 1.1), (0.5, 1.6, 0.8), M.principled('MuleM%d' % k, base=(0.12, 0.09, 0.07), rough=0.8))
    key_loc(mule, [(0, (-4.6 - 1.2 * k, 13.5, 1.1)), (NF, (-4.6 - 1.2 * k, 21.5, 1.1))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.orbit((0, 2, 0.8), r=15, a0=-120, a1=-95, h=2.4, look_h=0.8), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
