"""nazca-lines-peru-2024 b02_drone_grid (24 mm, crane up; VO "A machine just found three hundred and three that weren't."): Drone-height wide over the pampa, a survey grid fades in and cells light up one by one.
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
pampa(NF, sun_az=70, elev=30)
long_lines(n=6)
hummingbird(loc=(-260, 120, 0))
ai_grid(NF, center=(0, 0), n=10, cell=60)
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.crane((-120, -560, 160), (0, 0, 0), dz=120, dlook=0), 24, fstop=11, focus=600.0)
go(cam, NF, a, sc, meter=NF // 2)
