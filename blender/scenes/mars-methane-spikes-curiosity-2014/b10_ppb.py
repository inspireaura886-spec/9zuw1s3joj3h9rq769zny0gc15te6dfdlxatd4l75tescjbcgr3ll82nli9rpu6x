"""mars b10_ppb (CLOSE accent 50 mm, push-in; VO 'twenty-one parts per billion.'). CLOSE accent: mast head and inlet in night gas wisps; slow push. Remotion chip "21 ppbv".
NF default 52 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 52, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.28)
gradient_world('NightSky', up=(0.004, 0.005, 0.01), mid=(0.012, 0.01, 0.012), down=(0.003, 0.002, 0.002), light=0.6)
CN.sun(elev=35, az=300, warmth=(0.55, 0.62, 0.8), strength=0.4, check=False)
H0 = crater_height(0, -1500, **CRATER)
crater('Gale', size=9000, res=200, center=(0, 1500, -H0 - 3.0))
mars_ground('Floor', size=600, center=(0, 0, 0), rocks=70, seed=14)
rover('Rover', loc=(0, 0, 0), yaw=0, NF=NF)
Wd.spot('Rim', (-1.0, 3.0, 3.6), (0.85, 0.5, 2.3), color=(0.6, 0.75, 1.0), power=60, size_deg=30)
gas('Gas', (0.6, 0.5, 2.0), (5, 5, 2.4), [(0, 0.08), (NF, 0.11)], emit=0.8, noise_scale=2.5, NF=NF)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.push_in((2.6, -1.4, 2.5), (0.85, 0.5, 2.28), amount=0.15), lens=55, fstop=2.4, focus='RoverHead')
go(cam, NF, a, sc, meter=NF // 2, target=0.12)
