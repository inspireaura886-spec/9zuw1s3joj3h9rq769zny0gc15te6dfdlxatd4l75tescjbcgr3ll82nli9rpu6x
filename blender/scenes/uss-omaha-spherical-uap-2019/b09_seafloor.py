"""uss-omaha-spherical-uap-2019 b09_seafloor (28 mm, crane down; VO 'It found nothing. No wreckage. No debris.'): Lamp beam sweeping an empty sandy seabed, motes drifting, nothing there.
NF default 89 = 7 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
deep_water(floor_z=-110)
b = Wd.spot('SweepLamp', (0, -30, -80), (-20, 30, -110), color=(0.8, 0.9, 1.0), power=60000, size_deg=24, blend=0.5)
key_loc(b, [(0, (0, -30, -80)), (NF, (25, -20, -80))])
cam = C.Cam(clip_end=2000)
ease_cam(cam, NF, C.crane((-14, -26, -92), (6, 30, -110), dz=-8, dlook=0), 28, fstop=8, focus=50.0)
go(cam, NF, a, sc, meter=NF // 2)
