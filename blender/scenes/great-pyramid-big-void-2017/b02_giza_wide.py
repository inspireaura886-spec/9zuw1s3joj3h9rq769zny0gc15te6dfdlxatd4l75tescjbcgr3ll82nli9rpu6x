"""great-pyramid-big-void-2017 b02_giza_wide (24 mm, low lateral dolly; VO 'And no one can get in.'): Giza plateau at dawn, the whole Great Pyramid from the south-west at 520 m, long shadows, haze.
NF default 78 = 6 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 78, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
desert(NF, sun_az=95, elev=7)
great_pyramid()
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.dolly((-430, -380, 5), (-370, -430, 9), look=(0, 0, 55)), 24, fstop=11, focus=560.0)
go(cam, NF, a, sc, meter=NF // 2)
