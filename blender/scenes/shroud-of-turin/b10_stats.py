"""shroud-of-turin b10_stats (MEDIUM-WIDE 30 mm, orbit; VO 'and statisticians found the lab numbers less consistent than published.').
illustration: the three markers drift apart vertically; chip "2019/2020 re-analyses: less consistent"
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(10)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
Wd.hdri('moonless_golf', strength=0.02)
dated_bars(NF, spread=0.25)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.orbit((0, 0, 0.4), r=4.0, a0=285, a1=255, h=(0.6, 0.4), look_h=0.0), lens=30, fstop=5.6, focus=4.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.14)
