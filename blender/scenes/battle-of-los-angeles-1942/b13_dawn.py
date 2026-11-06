"""s13 WIDE 24 mm 'Same night. Two different answers.' First light over the basin: searchlights off, smoke puffs
hanging high, the city still dark. Crane DOWN."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
mats()
towns = la_night(NF, moon=0.0, seed=7, haze=0.0006)
for t in towns:
    city_strength(t, [(0, 2.5)])  # blackout: only a few stray lights
w = bpy.context.scene.world
w.name = 'NightWorld'
Wd.hdri('qwantani_dawn_puresky', strength=0.3, bg_strength=0.7, rot=80, tint=(0.95, 0.88, 0.95))
CN.sun(elev=2.0, az=80, warmth='golden', strength=1.6)
smoke = fade_mat('Haze', base=(0.12, 0.12, 0.13), rough=1.0)
r = rng(5)
for k in range(30):
    s = sphere('Puff%d' % k, (r.uniform(-3000, 3000), 6000 + r.uniform(-2500, 2500), 3000 + r.uniform(-500, 500)), r.uniform(50, 110), smoke, 16)
    s.visible_shadow = False
key_fac(smoke, [(0, 0.45), (NF, 0.3)])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((0, -2200, 900), (0, 6000, 1500), dz=-500, dlook=-200), lens=24, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
