"""s10 WIDE 24 mm 'He probably bled to death.' The gully at dusk, light snow falling, a low dark silhouette in the hollow far
off (respectful, no detail). Push-in, stopping well short."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
alps(NF, seed=10, sun_elev=15, az=260, warmth='blue', snowfall=150)
s = crumple('Shape', (1.5, 31, -0.05), 0.9, bpy.data.materials['DarkShape'], seed=10, amp=0.2)
s.scale = (1.6, 0.6, 0.25)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((-4, 4, 2.0), (1.5, 31, 0.0), amount=0.12), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
