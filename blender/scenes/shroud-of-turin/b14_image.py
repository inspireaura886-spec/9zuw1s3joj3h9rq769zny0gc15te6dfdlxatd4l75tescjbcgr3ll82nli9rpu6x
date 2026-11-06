"""shroud-of-turin b14_image (MEDIUM-WIDE 35 mm, push-in; VO 'The bigger question was never the date. How was the image made?').
3D: slow push over the cloth toward the faint image area (real photo texture only)
NF default 144 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 144, int)
random.seed(14)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
cloth = chapel_case(NF)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.push_in((-1.0, -2.6, 2.3), (-0.6, 0, 0.88), amount=0.3), lens=35, fstop=4.0, focus=2.9)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
