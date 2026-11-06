"""stonehenge-altar-stone-2024 b04_fallen (MEDIUM 30 mm, orbit; VO 'It lies pinned under a fallen giant.').
3D: the recumbent Altar Stone with sarsen Stone 55 lying across it, inside the trilithon horseshoe; chip "Stone 80, 4.9 m"
NF default 87 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 87, int)
random.seed(4)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=60, elev=10, strength=4.0, hdri_strength=1.0)
grass_plain()
henge('H')
CN.haze(center=(0, 0, 15), size=(3000, 3000, 40), density=0.0015, color=(1.0, 0.88, 0.75), anisotropy=0.6, noise=0.2)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.orbit((0.2, 5.4, 0.4), r=9, a0=210, a1=238, h=(2.2, 2.8), look_h=0.0), lens=30, fstop=5.6, focus=9.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
