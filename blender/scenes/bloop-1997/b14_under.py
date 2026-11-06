"""bloop-1997 b14_under (WIDE 24 mm, eased dolly; VO 'Seawater carries that sound for thousands of kilometres.').
3D: under the floes, rings of sound spreading out through the dark sea channel
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(14)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=200, half=400, sun_az=60, sun_elev=60, sun_strength=3.5, density=0.02, scatter=(0.25, 0.55, 0.7),
           absorb=(0.1, 0.42, 0.55), up=(0.2, 0.5, 0.62), mid=(0.02, 0.08, 0.12), down=(0.0, 0.01, 0.015))
seabed('Bed', 900, 200, height=4.0, seed=3)
pulse_rings('R', (0, 0, -20), 5, 0, 14, 140.0, 80, rot=(1.5708, 0, 0))
cam = C.Cam(clip_end=3000)
cam.shot(0, NF, C.dolly((-40, -60, -30), (-10, -66, -30), look=(0, 40, -25), look1=(10, 40, -25)), lens=24, fstop=8, focus=80.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.16)
