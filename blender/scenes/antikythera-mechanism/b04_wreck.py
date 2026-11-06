"""s04 WIDE 24 mm 'They hauled up statues, glassware, coins,' The wreck field at 45 m: amphorae spilled in the sand, a
heroic statue lying face down, a diver silhouette with a lifting rope. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
seabed(NF, seed=3)
r = rng(3)
for k in range(22):
    amphora('Amph%d' % k, (r.uniform(-8, 8), r.uniform(4, 18), 0.15), rot=(math.radians(r.uniform(70, 100)), 0,
            math.radians(r.uniform(0, 360))), s=r.uniform(0.9, 1.1))
statue('Ephebe', (2.5, 9, 0.1), yaw=30)
f = figure('Diver', (-2, 7, 1.6), yaw=40, mat=bpy.data.materials['Canvas'] if bpy.data.materials.get('Canvas') else None)
key_loc(f, [(0, (-2, 7, 1.6)), (NF, (-1.6, 7.6, 2.0))], interp='LINEAR')
sag_rope('Line', (-1.8, 7.2, 3.2), (-1.0, 8.0, 40), sag=0.4, r=0.015)
cam = C.Cam(clip_end=400)
wide(cam, NF, C.dolly((-12, -6, 3.2), (-6, -8, 3.4), look=(0, 10, 0.6), look1=(2, 10, 0.6)), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
