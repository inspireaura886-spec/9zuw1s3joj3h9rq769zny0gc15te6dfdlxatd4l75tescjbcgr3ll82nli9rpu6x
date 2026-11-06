"""uss-stein-squid-claws-1978 b02_frigate_wide (28 mm, orbit; VO 'The frigate USS Stein had lost its sonar,'): Grey Pacific day, the frigate under way at a few knots, wide orbit from off the starboard bow.
NF default 101 = 8 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=False, glare=0.3)
sea_day(NF)
ship, dome = frigate()
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.orbit((0, 10, 6), r=230, a0=20, a1=40, h=(18, 24), look_h=4), 28, fstop=11, focus=230.0)
go(cam, NF, a, sc, meter=NF // 2)
