"""uss-stein-squid-claws-1978 b13_deep (24 mm, slow push into the dark; VO 'One estimate put the animal at a hundred and fifty feet.'): Deep water, a long unscaled silhouette half-lost in murk, arms trailing; no ship or ruler for scale.
NF default 135 = 11 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 135, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
underwater(depth_fog=0.05, color=(0.05, 0.14, 0.2), surface_z=200.0)
squid_silhouette('Shape', (0, 60, 0), mantle=6.0, yaw=70)
Wd.spot('Beam', (-20, 0, 60), (0, 60, 0), color=(0.6, 0.85, 1.0), power=300000, size_deg=18, blend=0.7)
cam = C.Cam(clip_end=2000)
ease_cam(cam, NF, C.push_in((-10, -10, 4), (0, 60, 0), amount=0.2), 24, fstop=8, focus=70.0)
go(cam, NF, a, sc, meter=NF // 2)
