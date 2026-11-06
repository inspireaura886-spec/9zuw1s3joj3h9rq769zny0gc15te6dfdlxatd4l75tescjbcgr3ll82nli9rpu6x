"""shroud-of-turin b05_cut (CLOSE accent 50 mm, push-in; VO 'In nineteen eighty-eight, one strip was cut from a corner').
3D: a thin strip separates from the corner of the cloth (eased); chip "21 April 1988"
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(5)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
cloth = chapel_case(NF)
strip = boxm('Strip', (2.12, 0.5, 0.87), (0.08, 0.016, 0.003), linen_mat('StripM'), 0.0)
for f, (x, z) in ((0, (2.12, 0.87)), (int(NF * 0.3), (2.12, 0.87)), (NF, (2.25, 0.95))):
    strip.location.x, strip.location.z = x, z
    strip.keyframe_insert('location', frame=f)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.push_in((2.3, 0.05, 1.15), (2.15, 0.5, 0.88), amount=0.25), lens=50, fstop=3.2, focus=0.55)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
