"""mars b07_wheels (CLOSE accent 50 mm, eased dolly; VO 'So the team doubted their own rover: its wheels, the rocks it crushed, the ground.'). CLOSE accent: worn wheels and rocker at ground level; slow lateral dolly along them.
NF default 179 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 179, int)
sc = core.reset(); look(sc, vol=True, glare=0.3, vignette=0.24)
mars_world('day', sun_elev=18, sun_az=140, sun_strength=5.0, haze_density=0.0008)
H0 = crater_height(0, -1500, **CRATER)
crater('Gale', size=9000, res=200, center=(0, 1500, -H0 - 3.0))
mars_ground('Floor', size=600, center=(0, 0, 0), rocks=70, seed=8)
rover('Rover', loc=(0, 0, 0), yaw=0, NF=NF, wheel_wear=0.6)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.dolly((1.6, -3.0, 0.45), (-0.9, -3.0, 0.5), look=(1.0, -1.15, 0.3), look1=(-1.0, -1.15, 0.32)), lens=50, fstop=2.8, focus=2.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.24)
