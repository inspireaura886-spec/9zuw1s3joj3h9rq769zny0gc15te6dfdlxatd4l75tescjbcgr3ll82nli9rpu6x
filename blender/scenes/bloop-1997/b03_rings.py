"""bloop-1997 b03_rings (WIDE 28 mm, orbit; VO 'It rose in pitch for about a minute.').
3D illustration: wide sound rings rolling through empty blue water, spacing tightening as the pitch rises (illustration label)
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(3)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=200, half=400, sun_az=60, sun_elev=60, sun_strength=4.5, density=0.018, scatter=(0.25, 0.55, 0.7),
           absorb=(0.1, 0.42, 0.55), up=(0.2, 0.5, 0.62), mid=(0.02, 0.08, 0.12), down=(0.0, 0.01, 0.015))
seabed('Bed', 900, 200, height=4.0, seed=3)
pulse_rings('R', (0, 120, -60), 6, 0, 12, 90.0, 70, rot=(1.5708, 0, 0))
cam = C.Cam(clip_end=3000)
cam.shot(0, NF, C.orbit((0, 60, -60), r=70, a0=250, a1=275, h=(8, 12), look_h=0.0), lens=28, fstop=8, focus=70.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.17)
