"""mars b03_trace (MEDIUM-WIDE 30 mm, orbit; VO 'Most days, barely a trace, like a pinch of salt in an Olympic pool.'). Rover medium-wide on the crater floor; a barely-there cyan wisp at wheel height (illustration). Eased orbit.
NF default 168 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 168, int)
sc = core.reset(); look(sc, vol=True, glare=0.3, vignette=0.22)
mars_world('day', sun_elev=20, sun_az=150, sun_strength=4.5, haze_density=0.0007)
H0 = crater_height(0, -1500, **CRATER)
crater('Gale', size=9000, res=200, center=(0, 1500, -H0 - 3.0))
mars_ground('Floor', size=600, center=(0, 0, 0), rocks=70, seed=4)
rover('Rover', loc=(0, 0, 0), yaw=30, mast_yaw=(-10, 15), NF=NF)
gas('Gas', (0.5, 0.5, 0.6), (9, 9, 1.4), [(0, 0.004), (NF, 0.006)], emit=0.15, NF=NF)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.orbit((0.3, 0, 0.9), r=9.5, a0=218, a1=246, h=(1.7, 2.1), look_h=0.1), lens=30, fstop=5.6, focus='RoverBody')
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
