"""bloop-1997 b05_myth (WIDE 24 mm, eased dolly; VO 'Then the stories called it a sea monster.').
3D illustration of the STORIES, not a claim: a huge vague dark shape far below in murky water; label "the stories"
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(5)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=160, half=400, sun_az=60, sun_elev=60, sun_strength=3.0, density=0.03, scatter=(0.25, 0.55, 0.7),
           absorb=(0.1, 0.42, 0.55), up=(0.2, 0.5, 0.62), mid=(0.02, 0.08, 0.12), down=(0.0, 0.01, 0.015))
seabed('Bed', 900, 160, height=4.0, seed=3)
sea_shape(NF, loc=(0, 40, -110), length=70)
cam = C.Cam(clip_end=3000)
cam.shot(0, NF, C.dolly((-30, -30, -40), (-18, -34, -42), look=(0, 40, -105), look1=(4, 40, -105)), lens=24, fstop=8, focus=80.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.14)
