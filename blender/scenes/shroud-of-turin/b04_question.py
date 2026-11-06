"""shroud-of-turin b04_question (MEDIUM 35 mm, push-in; VO 'Then science asked: how old is the cloth?').
3D: along the cloth toward one corner of the case
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(4)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
cloth = chapel_case(NF)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.push_in((2.8, -2.2, 1.7), (1.9, 0.3, 0.88), amount=0.3), lens=35, fstop=4.0, focus=2.6)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
