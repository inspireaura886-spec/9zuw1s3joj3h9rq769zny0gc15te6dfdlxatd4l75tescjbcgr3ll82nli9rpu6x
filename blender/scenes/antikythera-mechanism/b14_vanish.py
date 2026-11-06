"""s14 WIDE 24 mm 'Then it vanished. Nothing this complex appears again for a thousand years.' Dusk on a headland above
the Aegean: a few broken marble columns, the sea going dark (chip NEXT: 14TH-CENTURY EUROPEAN CLOCKS). Crane UP."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
antikythera_coast(NF, seed=14, sun_elev=2, az=270)
r = rng(14)
for k in range(7):
    h = r.uniform(2.5, 7.5) if k % 3 else 9.0
    cyl('Col%d' % k, (k * 3.2 - 9, 60, 140), (k * 3.2 - 9, 60, 140 + h), 0.7, bpy.data.materials['Marble'], 24)
boxm('Stylobate', (0, 60, 139.6), (26, 6, 0.8), bpy.data.materials['Marble'])
Wd.terrain('Headland', size=400, res=80, height=18, scale=0.01, center=(0, 60, 125), seed=14,
           mat=bpy.data.materials['Cliff'])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-26, 18, 141.5), (0, 70, 143), dz=9, dlook=-6), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
