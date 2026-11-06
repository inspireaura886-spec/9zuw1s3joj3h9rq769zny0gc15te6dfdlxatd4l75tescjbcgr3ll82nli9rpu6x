"""mars b13_night (WIDE 28 mm, eased dolly; VO 'Night: methane.'). Night: the gas lies pooled and still in a thin layer over the floor around the rover (illustration). Dolly.
NF default 42 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 42, int)
sc = core.reset(); look(sc, vol=True, glare=0.45, vignette=0.26)
gradient_world('NightSky', up=(0.004, 0.005, 0.01), mid=(0.012, 0.01, 0.012), down=(0.003, 0.002, 0.002), light=0.6)
CN.sun(elev=40, az=320, warmth=(0.55, 0.62, 0.8), strength=0.45, check=False)
H0 = crater_height(0, -1500, **CRATER)
crater('Gale', size=9000, res=200, center=(0, 1500, -H0 - 3.0))
mars_ground('Floor', size=600, center=(0, 0, 0), rocks=70, seed=16)
rover('Rover', loc=(0, 0, 0), yaw=15, NF=NF)
gas('Gas', (0, 2, 0.5), (40, 40, 1.1), [(0, 0.07), (NF, 0.075)], emit=0.6, NF=NF)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.dolly((-14, -15, 2.6), (-11, -15.5, 2.5), look=(0, 0, 0.6), look1=(1.0, 0.5, 0.6)), lens=28, fstop=5.6, focus='RoverBody')
go(cam, NF, a, sc, meter=NF // 2, target=0.12)
