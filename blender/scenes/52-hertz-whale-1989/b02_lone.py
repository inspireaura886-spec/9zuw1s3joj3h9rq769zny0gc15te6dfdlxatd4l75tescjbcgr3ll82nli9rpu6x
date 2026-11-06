"""52hz b02_lone (WIDE 24 mm, eased dolly; VO 'Fifty-two hertz.'). One whale, tiny in a vast blue, sun shafts slanting down; it glides right to left.
NF default 42 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 42, int)
sc = core.reset(); look(sc, vol=True, glare=0.3, vignette=0.22)
underwater(NF, depth=70, half=420, sun_az=70, sun_elev=64, sun_strength=6.0, density=0.022)
seabed('Bed', 900, 70, height=6.0, scale=0.012, seed=3)
w = whale('Whale', NF, beat=110)
move_line(w, NF, (14, 70, -26), (-0.11, 0, 0))
cam = C.Cam(clip_end=3000)
cam.shot(0, NF, C.dolly((-24, -34, -16), (-21, -28, -15.5), look=(10, 70, -24), look1=(8, 70, -24)), lens=24, fstop=8, focus=80.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
