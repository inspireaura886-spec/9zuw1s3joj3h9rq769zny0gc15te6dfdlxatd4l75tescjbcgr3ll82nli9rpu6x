"""yonaguni b03_whole (WIDE 24 mm, crane up; VO 'People call it Japans Atlantis. A sunken pyramid.'). Crane up and out: the whole formation reads like a stepped pyramid from above-front.
NF default 98 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=28, half=220, sun_az=100, sun_elev=66, sun_strength=5.5, density=0.026, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
sea_floor(28.0, 440.0)
terraces('T', origin=(0, 0, -26), steps=6, rise=2.0, tread=2.6, width=14.0, seed=3)
terraces('U', origin=(16, 10, -26), steps=4, rise=2.2, tread=2.2, width=9.0, seed=5, wall_side=False)
cam = C.Cam(clip_end=1500)
cam.shot(0, NF, C.crane((24, -28, -22), (4, 10, -20), dz=9, dlook=-2), lens=24, fstop=9, focus=38.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
