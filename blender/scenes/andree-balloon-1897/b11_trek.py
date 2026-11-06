"""s11 WIDE 24 mm 'Unhurt, they trekked nearly two hundred fifty miles over drifting ice,' Three tiny figures hauling
sledges in line between pressure ridges, long shadows. Crane UP to a high wide."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
arctic(NF, sun_elev=4, az=230, haze=0.0012, seed=11)
for k in range(3):
    s = sledge('Sledge%d' % k, (0, 30 + k * 9, 0.4), yaw=0)
    f = figure('Hauler%d' % k, (0, 34 + k * 9, 0.4), yaw=0, pose='haul')
    for o in (s, f):
        key_loc(o, [(0, (0, o.location.y, 0.4)), (NF, (0, o.location.y + 6, 0.4))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-28, -10, 6), (0, 45, 0), dz=48, dlook=0), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
