"""gobekli-tepe b13_houses (WIDE 28 mm, eased dolly; VO 'Newer digs found homes and grain grinding too.').
3D: rectangular domestic buildings and grinding stones beside the enclosures; chip "domestic finds, 2019"
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(13)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
pit_floor(70, z=-0.4)
enclosure('A', center=(0, 0, -0.4), r=8.0, n=10, h=4.5)
enclosure('B', center=(22, 12, -0.4), r=6.5, n=8, h=4.0, seed=2)
houses(4, origin=(-6, -18, -0.4))
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-24, -34, 3.0), (-14, -36, 3.0), look=(4, -18, 0), look1=(8, -18, 0)), lens=28, fstop=8, focus=24.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
