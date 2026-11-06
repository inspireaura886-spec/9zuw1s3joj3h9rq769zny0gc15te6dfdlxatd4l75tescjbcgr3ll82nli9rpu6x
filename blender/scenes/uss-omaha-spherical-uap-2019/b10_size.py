"""uss-omaha-spherical-uap-2019 b10_size (35 mm, orbit; VO 'He also says the ball was about six feet wide,'): IR recreation: the black sphere hovering low over grey water, slow orbit (no measuring scale drawn).
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=True, glare=0.2, sat=0.0, vignette=0.3)
ir_sea(NF)
sp = dark_sphere(loc=(0, 0, 9), ir=True)
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.orbit((0, 0, 9), r=26, a0=250, a1=280, h=(-2, -1), look_h=0), 35, fstop=8, focus=26.0)
go(cam, NF, a, sc, meter=NF // 2)
