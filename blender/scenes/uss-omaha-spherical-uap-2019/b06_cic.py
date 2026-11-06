"""uss-omaha-spherical-uap-2019 b06_cic (24 mm, dolly behind operators; VO 'On the tape, a sailor shouts: It splashed! It splashed!'): MOMENT (slow): wide CIC behind three seated operator silhouettes, hero monitor shows the disc going down.
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
tm = thermal_screen_mat('Thermal', NF, x0=0.6, x1=0.6, stop=0.05, sink=0.6)
scr = cic_room(NF, tm)
cam = C.Cam(clip_end=60)
ease_cam(cam, NF, C.dolly((-2.4, -2.6, 1.7), (-1.2, -2.2, 1.6), look=(0, 2.4, 1.15)), 24, fstop=5.6, focus=4.5)
go(cam, NF, a, sc, meter=NF // 2)
