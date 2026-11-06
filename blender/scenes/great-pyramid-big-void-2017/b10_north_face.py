"""great-pyramid-big-void-2017 b10_north_face (35 mm, crane up the face; VO 'In 2023, a smaller hidden corridor got a closer look.'): North face at morning: stepped courses, the original entrance and the paired chevron blocks above it; crane rises to the chevrons.
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
desert(NF, sun_az=60, elev=14)
great_pyramid()
zf = 25.0
yf = BASE / 2 * (1 - zf / HGT) + 1.0
chevrons((0, yf, zf - 3), span=7.0)
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.crane((14, yf + 60, 6), (0, yf, zf - 6), dz=16, dlook=6), 35, fstop=8, focus=62.0)
go(cam, NF, a, sc, meter=NF // 2)
