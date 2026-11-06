"""s15 WIDE 28 mm 'and war nerves.' The gun pit at first light: barrel still raised, spent brass on the boards,
smoke hanging low. Orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
mats()
Wd.hdri('qwantani_dawn_puresky', strength=0.3, bg_strength=0.7, rot=80, tint=(0.9, 0.9, 1.0))
CN.sun(elev=3.0, az=80, warmth='golden', strength=2.0)
gm = M.texture_set('Ground', 'dry_ground_rocks', scale=0.2, tint=(0.4, 0.36, 0.3), box=True)
Wd.terrain('Ground', size=800, res=120, height=3, scale=0.01, center=(0, 0, -0.2), seed=4, mat=gm)
aa_gun('Gun', (0, 0, 0), NF, yaw=10, elev=58)
brass = M.principled('Brass', base=(0.72, 0.52, 0.22), rough=0.25, metal=1.0, grime=0.3)
r = rng(9)
for k in range(28):
    c = cyl('Case%d' % k, (0, 0, 0), (0, 0.58, 0), 0.04, brass, 12)
    c.location = (r.uniform(-1.3, 1.3), r.uniform(-1.3, 1.3), 0.34)
    c.rotation_mode = 'XYZ'
    c.rotation_euler = (0, math.radians(90), r.uniform(0, 6.28))
smoke_layer((0, 0, 3), (60, 60, 6), density=0.02, color=(0.6, 0.6, 0.62))
cam = C.Cam()
wide(cam, NF, C.orbit((0, 0, 1.0), r=9, a0=200, a1=235, h=(2.4, 2.0), look_h=0.8), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
