"""shroud-of-turin b03_trad (WIDE 24 mm, crane up; VO 'Tradition links it to the burial of Jesus.').
3D: the chapel wide, warm candle-coloured light, the case small in frame; chip "Turin Cathedral"
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(3)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
cloth = chapel_case(NF)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.crane((0, -9, 1.6), (0, 0, 1.0), dz=3.0, dlook=-0.3), lens=24, fstop=5.6, focus=9.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
