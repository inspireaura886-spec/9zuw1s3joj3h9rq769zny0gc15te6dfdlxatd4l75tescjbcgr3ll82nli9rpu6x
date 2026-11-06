"""shroud-of-turin b13_verdict (WIDE 24 mm, crane up; VO 'A former Nature editor: not substantially wrong, but not definitive.').
3D: chapel pull back and up, the case small; chip "Philip Ball, ex-Nature editor, 2019"
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(13)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
cloth = chapel_case(NF)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.crane((-4, -8, 1.8), (0, 0, 0.9), dz=3.5, dlook=-0.4), lens=24, fstop=5.6, focus=9.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
