"""gobekli-tepe b07_tops (WIDE 24 mm, crane down; VO 'He knew what they were: the tops of buried pillars.').
3D: the T-heads of buried pillars just breaking the surface in a ring
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(7)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
enclosure('A', center=(0, 0, 0), r=8.0, n=10, h=4.5, fill=3.6)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((-10, -18, 12), (0, 0, 0), dz=-8, dlook=0), lens=24, fstop=8, focus=20.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.27)
