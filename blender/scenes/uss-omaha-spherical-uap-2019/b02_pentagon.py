"""uss-omaha-spherical-uap-2019 b02_pentagon (28 mm, orbit; VO 'The Pentagon confirmed the video is real.'): Aerial dusk orbit of a generic five-ring Pentagon, parking lots, city lights coming on.
NF default 89 = 7 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
CN.hdri_sun('qwantani_dawn_puresky', sun_az=250, strength=0.5)
CN.sun(elev=2, az=250, warmth='late', strength=1.5, check=False)
pentagon()
CN.haze(center=(0, 0, 100), size=(4000, 4000, 200), density=0.0006, color=(0.9, 0.85, 0.95))
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.orbit((0, 0, 0), r=520, a0=200, a1=222, h=(300, 280), look_h=0), 28, fstop=11, focus=600.0)
go(cam, NF, a, sc, meter=NF // 2)
