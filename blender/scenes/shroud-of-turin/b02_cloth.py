"""shroud-of-turin b02_cloth (WIDE 28 mm, eased dolly; VO 'It came from a linen cloth with the faint image of a man.').
3D: the long linen cloth in its low glass case in a dim chapel (proportions only; the faint image is the real photo texture, no face modelled)
NF default 156 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 156, int)
random.seed(2)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
cloth = chapel_case(NF)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.dolly((-6, -6, 2.2), (-3.5, -6.5, 2.2), look=(0, 0, 0.9), look1=(0.8, 0, 0.9)), lens=28, fstop=5.6, focus=7.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
