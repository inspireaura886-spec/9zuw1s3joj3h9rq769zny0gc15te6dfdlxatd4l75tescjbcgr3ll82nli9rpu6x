"""uss-omaha-spherical-uap-2019 b15_empty (24 mm, crane down; VO 'Nothing was ever pulled out.'): Underwater looking up at the moonlit surface, empty dark water column; crane down away from it.
NF default 66 = 5 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 66, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
deep_water(floor_z=-150, floor=False)
CN.sun(elev=60, az=200, warmth='blue', strength=0.8, check=False)
boxm('SurfUnder', (0, 0, 0.05), (2000, 2000, 0.1), mat_once('SurfU', base=(0.3, 0.4, 0.5), rough=0.05, transmission=0.9, ior=1.33))
cam = C.Cam(clip_end=2000)
ease_cam(cam, NF, C.crane((0, -10, -20), (0, 30, 0), dz=-15, dlook=0), 24, fstop=8, focus=40.0)
go(cam, NF, a, sc, meter=NF // 2)
