"""stonehenge-altar-stone-2024 b03_guide (WIDE 28 mm, eased dolly; VO 'Every guidebook said: green sandstone, from Welsh hills.').
3D reconstruction (illustrative layout): Stonehenge at dawn from outside the ring
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(3)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=55, elev=6, strength=4.0, hdri_strength=1.0)
grass_plain()
henge('H')
CN.haze(center=(0, 0, 15), size=(3000, 3000, 40), density=0.0015, color=(1.0, 0.88, 0.75), anisotropy=0.6, noise=0.2)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-30, -48, 2.2), (-20, -50, 2.4), look=(0, 0, 3.0), look1=(2, 0, 3.0)), lens=28, fstop=8, focus=50.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
