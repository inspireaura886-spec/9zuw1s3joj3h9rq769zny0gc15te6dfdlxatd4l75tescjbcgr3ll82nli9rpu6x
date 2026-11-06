"""bloop-1997 b09_deep (WIDE 24 mm, crane down; VO 'The writer asked if something bigger than any whale was down there.').
3D: descending into the dark water column, the vague shape of the stories fading below
NF default 144 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 144, int)
random.seed(9)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=300, half=400, sun_az=60, sun_elev=60, sun_strength=3.0, density=0.025, scatter=(0.25, 0.55, 0.7),
           absorb=(0.1, 0.42, 0.55), up=(0.2, 0.5, 0.62), mid=(0.02, 0.08, 0.12), down=(0.0, 0.01, 0.015))
seabed('Bed', 900, 300, height=4.0, seed=3)
sea_shape(NF, loc=(0, 30, -220), length=70)
cam = C.Cam(clip_end=4000)
cam.shot(0, NF, C.crane((0, -40, -60), (0, 30, -200), dz=-30, dlook=-10), lens=24, fstop=8, focus=150.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.12)
