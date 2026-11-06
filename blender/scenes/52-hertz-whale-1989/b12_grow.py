"""52hz b12_grow (MEDIUM-WIDE 30 mm, orbit; VO 'Over the years its voice deepened, slightly, like an animal growing up.'). Slow orbit on the whale; its rings come a touch larger and slower over the shot (deepening voice, illustration).
NF default 144 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 144, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=70, half=400, sun_az=30, sun_elev=62, sun_strength=5.5, density=0.022)
seabed('Bed', 800, 70, height=7.0, scale=0.012, seed=17)
w = whale('Whale', NF, beat=120, phase=0.2)
move_line(w, NF, (6, 0, -28), (-0.07, 0, 0))
for k, (f0, g) in enumerate(((10, 30), (55, 36), (100, 42))):
    pulse_rings('Voice%d' % k, (2, 0, -27), 1, f0, 40, g, 70, color=(0.6, 0.92, 1.0), strength=5.0, w=0.025, rot=(math.radians(90), 0, 0))
cam = C.Cam(clip_end=2500)
cam.shot(0, NF, C.orbit((4, 0, -28), r=48, a0=238, a1=262, h=(6, 3), look_h=0.0), lens=30, fstop=6.3, focus='WhaleBody')
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
