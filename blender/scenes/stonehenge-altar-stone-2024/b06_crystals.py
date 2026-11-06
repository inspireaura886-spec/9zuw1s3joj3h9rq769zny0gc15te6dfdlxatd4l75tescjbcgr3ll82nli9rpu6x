"""stonehenge-altar-stone-2024 b06_crystals (CLOSE accent 50 mm, push-in; VO 'Inside them, tiny crystals, each one a clock of when it formed.').
illustration: glowing mineral grains (zircon/apatite) drifting in the dark; label "illustration"
NF default 144 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 144, int)
random.seed(6)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
Wd.hdri('moonless_golf', strength=0.02)
grains(NF, n=60, spread=1.2)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((0, -4.0, 0.2), (0, 0, 0), amount=0.35), lens=50, fstop=2.8, focus=3.2)
go(cam, NF, a, sc, meter=NF // 2, target=0.16)
