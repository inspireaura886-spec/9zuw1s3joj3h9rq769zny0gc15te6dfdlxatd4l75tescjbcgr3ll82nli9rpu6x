"""bloop-1997 b02_array (WIDE 24 mm, crane down; VO 'Underwater microphones more than three thousand kilometres apart all caught it.').
3D: one generic moored hydrophone on its cable in open blue water (illustrative, no real array layout claimed); chip "hydrophones 3,000+ km apart"
NF default 133 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
random.seed(2)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=120, half=400, sun_az=60, sun_elev=60, sun_strength=5.0, density=0.02, scatter=(0.25, 0.55, 0.7),
           absorb=(0.1, 0.42, 0.55), up=(0.2, 0.5, 0.62), mid=(0.02, 0.08, 0.12), down=(0.0, 0.01, 0.015))
seabed('Bed', 900, 120, height=4.0, seed=3)
met = M.principled('HydM', base=(0.3, 0.32, 0.33), metal=0.8, rough=0.4, grime=0.5)
cyl('Cable', (0, 0, -40), (0, 0, -120), 0.03, met)
cyl('Hydro', (0, 0, -40 - 0.6), (0, 0, -40 + 0.6), 0.14, met)
pulse_rings('R', (0, 60, -40), 4, 0, 18, 40.0, 60, rot=(1.5708, 0, 0))
cam = C.Cam(clip_end=2000)
cam.shot(0, NF, C.crane((-14, -22, -28), (0, 0, -40), dz=-8, dlook=-1), lens=24, fstop=8, focus=26.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
