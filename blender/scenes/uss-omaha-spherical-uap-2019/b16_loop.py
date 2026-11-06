"""uss-omaha-spherical-uap-2019 b16_loop (28 mm, slow push; VO 'Nobody explained it.'): IR recreation wide of the empty grey sea where it went in (loops back to the hook).
NF default 75 = 3 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
sc = core.reset(); look(sc, vol=True, glare=0.2, sat=0.0, vignette=0.3)
ir_sea(NF)
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.push_in((-15, -10, 11), (8, 220, 0), amount=0.12), 28, fstop=11, focus=230.0)
go(cam, NF, a, sc, meter=NF // 2)
