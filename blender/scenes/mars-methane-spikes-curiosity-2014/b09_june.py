"""mars b09_june (WIDE 28 mm, push-in; VO 'In June twenty nineteen came the biggest spike yet:'). Night in the crater: stars, cold blue key, the densest gas pooled around the rover (illustration). Push-in.
NF default 110 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 110, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.26)
mars_world('night', sun_elev=30, sun_az=300, sun_strength=0.35, haze=False)
H0 = crater_height(0, -1500, **CRATER)
crater('Gale', size=9000, res=200, center=(0, 1500, -H0 - 3.0))
mars_ground('Floor', size=600, center=(0, 0, 0), rocks=70, seed=12)
rover('Rover', loc=(0, 0, 0), yaw=-40, NF=NF)
cyl('RoverWorkLight', (0.9, 0.5, 2.35), (1.0, 0.5, 2.35), 0.02, M.emission('WLM', color=(1.0, 0.9, 0.8), strength=40.0), 8)
gas('Gas', (0, 0, 1.0), (20, 20, 2.2), [(0, 0.05), (NF, 0.07)], emit=0.6, NF=NF)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.push_in((-12, -14, 3.2), (0, 0, 0.9), amount=0.18), lens=28, fstop=4.0, focus='RoverBody')
go(cam, NF, a, sc, meter=NF // 2, target=0.12)
