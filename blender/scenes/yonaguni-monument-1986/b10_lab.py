"""yonaguni b10_lab (CLOSE accent 50 mm, push-in; VO 'Sandstone, laid down about twenty million years ago.'). CLOSE accent: the layered sandstone sample under a desk lamp on a worn bench; bedding bands visible. Push-in.
NF default 98 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
sc = core.reset(); look(sc, vol=False, glare=0.3, vignette=0.24)
lab_sample(NF)
cam = C.Cam(clip_end=50)
cam.shot(0, NF, C.push_in((0.35, -0.75, 1.12), (0, 0, 0.87), amount=0.18), lens=50, fstop=2.8, focus='Sample')
go(cam, NF, a, sc, meter=NF // 2, target=0.28)
