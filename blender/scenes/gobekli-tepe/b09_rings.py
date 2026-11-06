"""gobekli-tepe b09_rings (WIDE 24 mm, orbit; VO 'Rings of T-shaped pillars, up to five and a half metres tall,').
3D: a full enclosure ring, wall and T-pillars, wide orbit; chip "up to 5.5 m"
NF default 144 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 144, int)
random.seed(9)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
pit_floor(70, z=-0.4)
enclosure('A', center=(0, 0, -0.4), r=8.0, n=10, h=4.5)
enclosure('B', center=(22, 12, -0.4), r=6.5, n=8, h=4.0, seed=2)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.orbit((0, 0, 1.0), r=22, a0=200, a1=228, h=(7, 9), look_h=0.0), lens=24, fstop=8, focus=22.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
