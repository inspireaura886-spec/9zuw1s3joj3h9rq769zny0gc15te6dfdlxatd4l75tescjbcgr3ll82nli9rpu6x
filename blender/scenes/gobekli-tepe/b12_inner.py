"""gobekli-tepe b12_inner (WIDE 24 mm, crane up; VO 'and set new ones in a smaller ring inside.').
3D: an older outer ring with a newer, smaller ring set inside it
NF default 110 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 110, int)
random.seed(12)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
pit_floor(70, z=-0.4)
enclosure('O', center=(0, 0, -0.4), r=10.0, n=12, h=4.0, centre_pair=False, seed=3)
enclosure('I', center=(0, 0, -0.4), r=5.5, n=7, h=3.6, seed=4)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((-18, -22, 6), (0, 0, 0), dz=14, dlook=-2), lens=24, fstop=8, focus=28.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
