"""gobekli-tepe b05_moment (WIDE 28 mm, eased dolly; VO 'In nineteen ninety-four, German archaeologist Klaus Schmidt walked this hill,').
MOMENT, told slower: the unexcavated hilltop in 1994 light, pillar heads barely showing through the soil, no person shown; chip "Klaus Schmidt, Oct 1994"
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(5)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
enclosure('A', center=(0, 0, 0), r=8.0, n=10, h=4.5, fill=4.0)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-24, -30, 1.7), (-14, -32, 1.7), look=(0, 0, 0.3), look1=(3, 0, 0.3)), lens=28, fstop=8, focus=34.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.27)
