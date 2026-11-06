"""52hz b06_empty (WIDE 24 mm, crane up; VO 'And nobody has ever seen the animal.'). Crane up the empty water column toward the bright rippling surface: no whale anywhere.
NF default 87 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 87, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.22)
underwater(NF, depth=90, half=420, sun_az=55, sun_elev=72, sun_strength=6.5, density=0.02)
seabed('Bed', 900, 90, height=10.0, scale=0.01, seed=11)
cam = C.Cam(clip_end=3000)
cam.shot(0, NF, C.crane((0, -10, -60), (0, 40, -20), dz=18, dlook=14), lens=24, fstop=9, focus=60.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
