"""mars b08_real (MEDIUM 30 mm, orbit; VO 'The readings were real.'). Rover medium, mast up and panning; Mount-Sharp-like mound behind. Orbit.
NF default 52 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 52, int)
sc = core.reset(); look(sc, vol=True, glare=0.3, vignette=0.22)
mars_world('day', sun_elev=24, sun_az=110, sun_strength=4.8, haze_density=0.0007)
H0 = crater_height(0, -1500, **CRATER)
crater('Gale', size=9000, res=200, center=(0, 1500, -H0 - 3.0))
mars_ground('Floor', size=600, center=(0, 0, 0), rocks=70, seed=10)
rover('Rover', loc=(0, 0, 0), yaw=95, mast_yaw=(20, -15), NF=NF)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.orbit((0, 0, 1.2), r=7.0, a0=290, a1=270, h=(0.6, 0.9), look_h=0.3), lens=30, fstop=5.6, focus='RoverBody')
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
