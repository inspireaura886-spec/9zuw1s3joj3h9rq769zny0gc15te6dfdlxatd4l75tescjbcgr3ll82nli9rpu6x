"""bloop-1997 b11_ice (WIDE 24 mm, eased dolly; VO 'Far to the south, Antarctic ice made the same shape of sound.').
3D: Antarctic ice front at a low sun, floes on dark water (generic, not a named shelf); chip "Antarctica"
NF default 144 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 144, int)
random.seed(11)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=200, elev=5, strength=3.0, hdri_strength=0.8)
swell_ocean(NF, half=3000, wave_scale=0.8, wind=8, color=(0.008, 0.02, 0.03))
ice_shelf(NF, calve=False)
ice_floes(30, 200)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-60, -120, 6), (-30, -125, 6), look=(0, 30, 10), look1=(10, 30, 10)), lens=24, fstop=8, focus=150.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
