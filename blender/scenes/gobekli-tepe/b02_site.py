"""gobekli-tepe b02_site (WIDE 24 mm, crane up; VO 'They were raised about eleven and a half thousand years ago.').
3D reconstruction (illustrative layout, not survey-accurate): excavated enclosures on the limestone ridge at dawn; chip "Gobekli Tepe, Sanliurfa, Turkey"
NF default 133 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
random.seed(2)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
pit_floor(70, z=-0.4)
enclosure('A', center=(0, 0, -0.4), r=8.0, n=10, h=4.5)
enclosure('B', center=(22, 12, -0.4), r=6.5, n=8, h=4.0, seed=2)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((-26, -34, 4), (8, 4, 0), dz=16, dlook=-3), lens=24, fstop=8, focus=40.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
