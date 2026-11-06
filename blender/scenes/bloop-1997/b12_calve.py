"""bloop-1997 b12_calve (WIDE 28 mm, push-in; VO 'Icebergs cracking and breaking off glaciers: icequakes.').
3D: a block of the ice front tilts and slides into the sea (eased, camera smooth); chip "icequake"
NF default 87 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 87, int)
random.seed(12)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=200, elev=5, strength=3.0, hdri_strength=0.8)
swell_ocean(NF, half=3000, wave_scale=0.8, wind=8, color=(0.008, 0.02, 0.03))
ice_shelf(NF, calve=True)
ice_floes(20, 150)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.push_in((-20, -90, 5), (2, 18, 10), amount=0.2), lens=28, fstop=8, focus=105.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
