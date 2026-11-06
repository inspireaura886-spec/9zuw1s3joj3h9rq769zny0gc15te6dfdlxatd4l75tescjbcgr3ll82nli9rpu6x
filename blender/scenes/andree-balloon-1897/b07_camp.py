"""s07 MEDIUM 35 mm 'A boathook with the expedition's name. A journal. Two skeletons.' The camp among rocks and snow
patches: a boathook leaning on a boulder, a leather journal, a weathered canvas mound. No remains are shown. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
kvitoya(NF, seed=5)
st = M.texture_set('Boulder', 'rocky_terrain_02', scale=0.6, tint=(0.36, 0.34, 0.31), box=True)
r = rng(8)
for k in range(14):
    sphere('Rock%d' % k, (r.uniform(-6, 6), 120 + r.uniform(-4, 6), 0.2), r.uniform(0.3, 1.1), st, 16, scale=(1.3, 1.0, 0.7))
hook = cyl('Boathook', (1.2, 119.0, 0.2), (0.4, 120.6, 2.3), 0.035, bpy.data.materials['OldWood'], 10)
cyl('Hook', (0.4, 120.6, 2.3), (0.55, 120.4, 2.5), 0.02, bpy.data.materials['Galv'], 8)
boxm('Journal', (-0.8, 118.6, 0.62), (0.18, 0.24, 0.04), bpy.data.materials['Leather'], 0.01)
crumple('Mound', (-2.6, 121.2, 0.3), (2.6, 1.8), bpy.data.materials['Canvas'], seed=3, amp=0.6)
for k in range(6):
    crumple('SnowP%d' % k, (r.uniform(-7, 7), 120 + r.uniform(-3, 6), 0.25), (r.uniform(1, 2.5), r.uniform(1, 2)), bpy.data.materials['Snow'], seed=20 + k, amp=0.1)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((1.8, 113.2, 1.7), (-0.4, 120, 0.8), amount=0.3), lens=35, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
