"""mars b14_day (WIDE 28 mm, eased dolly; VO 'Day: zero. Sunlight churns it away.'). Day, same framing family as b13: sunlit floor, the gas thins, lifts and drifts away (illustration). Dolly.
NF default 75 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
mars_world('day', sun_elev=32, sun_az=130, sun_strength=5.0, haze_density=0.0008)
H0 = crater_height(0, -1500, **CRATER)
crater('Gale', size=9000, res=200, center=(0, 1500, -H0 - 3.0))
mars_ground('Floor', size=600, center=(0, 0, 0), rocks=70, seed=16)
rover('Rover', loc=(0, 0, 0), yaw=15, NF=NF)
gas('Gas', (0, 2, 0.8), (40, 40, 1.6), [(0, 0.05), (int(NF * 0.6), 0.012), (NF, 0.0)], emit=0.2, rise=6.0, NF=NF)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.dolly((-11, -15.5, 2.5), (-8, -16, 2.4), look=(1.0, 0.5, 0.6), look1=(2.0, 1.0, 0.8)), lens=28, fstop=8, focus='RoverBody')
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
