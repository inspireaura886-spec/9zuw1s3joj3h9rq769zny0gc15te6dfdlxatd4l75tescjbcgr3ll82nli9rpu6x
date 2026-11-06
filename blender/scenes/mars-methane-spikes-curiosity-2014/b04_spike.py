"""mars b04_spike (WIDE 28 mm, push-in; VO 'Then it spikes.'). The spike: the gas blooms around the rover, rising and spreading (illustration). Push-in from wide.
NF default 42 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 42, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
mars_world('dusk', sun_elev=8, sun_az=240, sun_strength=3.2, haze_density=0.0008)
H0 = crater_height(0, -1500, **CRATER)
crater('Gale', size=9000, res=200, center=(0, 1500, -H0 - 3.0))
mars_ground('Floor', size=600, center=(0, 0, 0), rocks=70, seed=6)
rover('Rover', loc=(0, 0, 0), yaw=-20, NF=NF)
gas('Gas', (0, 0, 2.0), (24, 24, 4.5), [(0, 0.004), (int(NF * 0.25), 0.03), (NF, 0.09)], emit=0.4, NF=NF)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.push_in((-16, -18, 4.0), (0, 0, 1.0), amount=0.2), lens=28, fstop=6.3, focus='RoverBody')
go(cam, NF, a, sc, meter=NF // 2, target=0.22)
