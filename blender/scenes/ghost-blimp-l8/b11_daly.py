"""s11 WIDE 24 mm 'then sagged onto Bellevue Avenue in Daly City.' Residential street from above; the envelope folds down
over the road between the houses (sag key 0.3 -> 1.0). Crane DOWN."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=34, az=140, haze=0.003, sea=False, fog_h=80)
street('St', NF, length=140, houses=10)
b = blimp('L8', (0, 70, 9.5), NF, sag=[(0, 0.3), (NF, 1.0)], props=False, yaw=8)
fly_keys(b, [(0, (0, 70, 11.0), 8), (NF, (0, 70, 7.7), 10)])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-24, 10, 40), (0, 70, 2), dz=-18, dlook=0), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
