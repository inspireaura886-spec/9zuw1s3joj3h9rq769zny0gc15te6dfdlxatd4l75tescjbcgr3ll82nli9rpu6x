"""s03 WIDE 24 mm 'In July eighteen ninety-seven, Salomon Andree lifted off from Svalbard, north of Norway,' Danes Island:
the tall open-topped plank balloon house on the shore, mountains behind, the balloon rising out of it (chip 11 JUL 1897).
Crane UP."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
arctic(NF, sun_elev=14, az=170, haze=0.0010, seed=2, floes=20, warmth='noon')
rk = M.texture_set('Mtn', 'rocky_terrain_02', scale=0.02, tint=(0.35, 0.33, 0.31), box=True)
Wd.terrain('Mountains', size=5000, res=160, height=420, scale=0.0009, center=(0, 2600, -30), seed=4, mat=rk)
boxm('Shore', (0, 200, 0.5), (1600, 600, 2.0), M.texture_set('ShoreS', 'rocky_terrain_02', scale=0.1, tint=(0.4, 0.38, 0.35), box=True))
balloon_house('House', (0, 120, 1.5))
b = balloon('Ornen', (0, 120, 3), NF)
key_loc(b, [(0, (0, 120, 3)), (int(NF * 0.2), (0, 120, 4)), (NF, (-6, 90, 36))])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-70, -40, 5), (0, 110, 22), dz=28, dlook=24), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
