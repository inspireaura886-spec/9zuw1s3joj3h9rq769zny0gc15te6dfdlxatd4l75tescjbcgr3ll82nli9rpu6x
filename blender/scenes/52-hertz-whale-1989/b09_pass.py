"""52hz b09_pass (MEDIUM 30 mm, push-in; VO 'following no other whales.'). The whale glides past camera-left at medium distance; empty water all around.
NF default 52 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 52, int)
sc = core.reset(); look(sc, vol=True, glare=0.3, vignette=0.22)
underwater(NF, depth=60, half=360, sun_az=120, sun_elev=60, sun_strength=6.0, density=0.025)
seabed('Bed', 700, 60, height=5.0, scale=0.014, seed=13)
w = whale('Whale', NF, beat=100, phase=0.7)
move_line(w, NF, (14, 30, -20), (-0.16, 0, 0.0))
cam = C.Cam(clip_end=2000)
cam.shot(0, NF, C.push_in((-8, -12, -18), (6, 30, -19.5), amount=0.12), lens=30, fstop=5.6, focus='WhaleBody')
go(cam, NF, a, sc, meter=NF // 2, target=0.19)
