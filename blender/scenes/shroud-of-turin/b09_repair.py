"""shroud-of-turin b09_repair (MEDIUM 35 mm, push-in; VO 'Critics said the corner might be a medieval repair,').
macro illustration: linen yarns with one pale cotton fibre; label "claim: medieval repair"
NF default 110 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 110, int)
random.seed(9)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
threads(NF, cotton=True)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0, -3.2, 1.6), (0, 0, 0), amount=0.25), lens=35, fstop=4.0, focus=3.5)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
