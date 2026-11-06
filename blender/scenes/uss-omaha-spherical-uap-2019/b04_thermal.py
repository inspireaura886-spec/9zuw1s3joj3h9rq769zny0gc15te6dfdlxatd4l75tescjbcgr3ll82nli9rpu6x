"""uss-omaha-spherical-uap-2019 b04_thermal (35 mm, push-in; VO "the USS Omaha's thermal camera locked onto a dark ball."): CIC: the hero monitor shows the night-IR sea (grey) with a small black disc under a reticle; other screens dim blue.
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
tm = thermal_screen_mat('Thermal', NF, stop=0.9, sink=0.98)
scr = cic_room(NF, tm)
cam = C.Cam(clip_end=60)
ease_cam(cam, NF, C.push_in((0.9, -0.6, 1.5), scr.location, amount=0.3), 35, fstop=4.0, focus=2.9)
go(cam, NF, a, sc, meter=NF // 2)
