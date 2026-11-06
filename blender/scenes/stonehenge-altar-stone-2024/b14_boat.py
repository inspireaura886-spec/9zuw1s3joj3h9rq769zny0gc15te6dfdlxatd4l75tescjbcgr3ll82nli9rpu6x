"""stonehenge-altar-stone-2024 b14_boat (MEDIUM 30 mm, orbit; VO 'Who built that boat, the crystals cant say.').
3D illustration: the same boat and slab, slow orbit, empty horizon
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(14)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=90, elev=6, strength=3.8, hdri_strength=1.0)
swell_ocean(NF, half=3000, wave_scale=1.1, wind=10, color=(0.01, 0.03, 0.04))
plank_boat('Boat', (0, 0, 0.1), rz=80)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.orbit((0, 0, 0.6), r=12, a0=200, a1=230, h=(2.6, 3.0), look_h=0.0), lens=30, fstop=5.6, focus=12.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
