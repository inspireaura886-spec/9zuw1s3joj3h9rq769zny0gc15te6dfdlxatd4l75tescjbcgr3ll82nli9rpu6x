"""stonehenge-altar-stone-2024 b13_sea (WIDE 28 mm, eased dolly; VO 'So the team thinks it went by sea.').
3D illustration: a generic plank boat carrying the green slab on a grey North Sea swell at dawn (no real vessel or route is known); label "illustration"
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(13)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=90, elev=6, strength=3.8, hdri_strength=1.0)
swell_ocean(NF, half=3000, wave_scale=1.1, wind=10, color=(0.01, 0.03, 0.04))
plank_boat('Boat', (0, 80, 0.1), rz=80)
CN.haze(center=(0, 400, 20), size=(3000, 3000, 60), density=0.0012, color=(1.0, 0.86, 0.72), anisotropy=0.6, noise=0.2)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-40, 10, 3.5), (-28, 14, 3.5), look=(0, 80, 1), look1=(0, 80, 1)), lens=28, fstop=8, focus=80.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
