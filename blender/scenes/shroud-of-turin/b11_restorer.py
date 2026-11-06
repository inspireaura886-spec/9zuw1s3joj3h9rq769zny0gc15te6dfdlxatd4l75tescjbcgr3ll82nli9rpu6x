"""shroud-of-turin b11_restorer (MEDIUM 35 mm, eased dolly; VO 'But a textile restorer found no sign of reweaving,').
macro illustration: an even herringbone weave, no foreign fibre; chip "restorer, 2002: no reweaving traces"
NF default 110 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 110, int)
random.seed(11)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
threads(NF, cotton=False)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.dolly((-1.2, -3.0, 1.4), (1.2, -3.0, 1.4), look=(-0.4, 0, 0), look1=(0.4, 0, 0)), lens=35, fstop=4.0, focus=3.3)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
