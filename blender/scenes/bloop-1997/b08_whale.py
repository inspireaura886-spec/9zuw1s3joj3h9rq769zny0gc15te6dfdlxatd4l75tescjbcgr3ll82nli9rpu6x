"""bloop-1997 b08_whale (WIDE 28 mm, orbit; VO 'but far more powerful than any animal on Earth.').
3D illustration: a blue-whale-sized loft swims with small rings; the Bloop rings far behind are vastly larger (scale comparison)
NF default 110 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 110, int)
random.seed(8)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=120, half=400, sun_az=60, sun_elev=60, sun_strength=5.0, density=0.02, scatter=(0.25, 0.55, 0.7),
           absorb=(0.1, 0.42, 0.55), up=(0.2, 0.5, 0.62), mid=(0.02, 0.08, 0.12), down=(0.0, 0.01, 0.015))
seabed('Bed', 900, 120, height=4.0, seed=3)
wh = loft('Whale', 25.0, [(0.0, 0.1, 0.1, 0.6), (0.2, 1.0, 0.8, 0.4), (0.7, 0.7, 0.55, 0.4), (1.0, 0.08, 0.05, 0.6)], n=18)
wh.data.materials.append(M.principled('WhM', base=(0.12, 0.15, 0.18), rough=0.5))
wh.location = (0, 0, -30)
move_line(wh, NF, (-10, 0, -30), (0.12, 0, 0))
pulse_rings('S', (0, 0, -30), 3, 0, 20, 12.0, 40, rot=(1.5708, 0, 0), strength=3.0)
pulse_rings('B', (0, 160, -50), 3, 0, 25, 160.0, 75, rot=(1.5708, 0, 0))
cam = C.Cam(clip_end=3000)
cam.shot(0, NF, C.orbit((0, 0, -30), r=55, a0=250, a1=272, h=(6, 9), look_h=0.0), lens=28, fstop=8, focus=55.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
