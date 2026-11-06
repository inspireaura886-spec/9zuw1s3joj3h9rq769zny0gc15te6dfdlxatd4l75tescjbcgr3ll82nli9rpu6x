"""uss-omaha-spherical-uap-2019 b12_pentagon_night (28 mm, crane down; VO 'The Pentagon only said the video was taken by Navy personnel,'): Night aerial of the five rings, lot lights, slow crane down toward the outer ring.
NF default 135 = 11 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 135, int)
sc = core.reset(); look(sc, vol=True, glare=0.45)
Wd.hdri('qwantani_night_puresky', strength=0.3, bg_strength=0.4)
Wd.moon(direction=(-0.4, 0.6, 0.4), strength=1.2)
pentagon()
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.crane((-380, -380, 420), (0, 0, 10), dz=-90, dlook=0), 28, fstop=11, focus=600.0)
go(cam, NF, a, sc, meter=NF // 2)
