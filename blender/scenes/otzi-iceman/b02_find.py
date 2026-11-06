"""s02 WIDE 28 mm 'Everyone thought a modern climber had died there.' The glacier gully on the pass, 1991: two hikers stand back
looking down; only a low dark shape at the melt line far off (no detail, no face). Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
alps(NF, seed=2, sun_elev=20, az=150)
hiker('Helmut', (-3.0, 24, 0.2), yaw=-20)
hiker('Erika', (-4.2, 23.4, 0.2), yaw=-35, col=(0.12, 0.25, 0.45))
s = crumple('Shape', (1.5, 31, -0.05), 0.9, bpy.data.materials['DarkShape'], seed=2, amp=0.2)
s.scale = (1.6, 0.6, 0.25)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.orbit((-1, 27, 0.8), r=14, a0=-130, a1=-105, h=2.2, look_h=0.4), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
