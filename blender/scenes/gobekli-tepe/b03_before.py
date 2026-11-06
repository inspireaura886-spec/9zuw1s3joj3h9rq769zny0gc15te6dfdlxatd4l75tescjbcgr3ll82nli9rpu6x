"""gobekli-tepe b03_before (WIDE 28 mm, eased dolly; VO 'Before pottery. Before farming towns. Six thousand years before Stonehenge.').
3D: low wide past the enclosure rim to the empty steppe; chips "c. 9600 BCE" / "Stonehenge: c. 3000 BCE"
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(3)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
pit_floor(70, z=-0.4)
enclosure('A', center=(0, 0, -0.4), r=8.0, n=10, h=4.5)
enclosure('B', center=(22, 12, -0.4), r=6.5, n=8, h=4.0, seed=2)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-18, -14, 1.6), (-8, -18, 1.8), look=(4, 4, 1.5), look1=(8, 4, 1.5)), lens=28, fstop=8, focus=18.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
