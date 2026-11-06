"""shroud-of-turin b07_result (MEDIUM-WIDE 30 mm, orbit; VO 'All three pointed to the Middle Ages,').
illustration: three glowing result markers in line; chip "1260-1390 AD, 95% (Nature, 1989)"
NF default 87 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 87, int)
random.seed(7)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
Wd.hdri('moonless_golf', strength=0.02)
dated_bars(NF, spread=0.0)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.orbit((0, 0, 0.4), r=4.0, a0=255, a1=285, h=(0.4, 0.6), look_h=0.0), lens=30, fstop=5.6, focus=4.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.14)
