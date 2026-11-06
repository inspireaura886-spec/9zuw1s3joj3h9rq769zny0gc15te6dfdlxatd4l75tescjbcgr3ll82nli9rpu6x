"""uss-omaha-spherical-uap-2019 b07_screen_vs (50 mm, push-in (close accent); VO "That's what the screen shows. Now the sea."): Close: the IR monitor now shows only empty grey water; the reticle on nothing.
NF default 101 = 8 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
tm = thermal_screen_mat('Thermal', NF, empty=True)
scr = cic_room(NF, tm)
cam = C.Cam(clip_end=60)
ease_cam(cam, NF, C.push_in((-0.35, 1.6, 1.3), scr.location, amount=0.25), 50, fstop=4.0, focus=0.75)
go(cam, NF, a, sc, meter=NF // 2)
