"""great-pyramid-big-void-2017 b03_sky (28 mm, crane up; VO 'Particles from space found it.'): Blue-hour sky above the apex, first faint muon streaks falling out of the dark sky toward the stone.
NF default 66 = 5 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 66, int)
sc = core.reset(); look(sc, vol=True, glare=0.45)
desert(NF, sun_az=95, elev=2, strength=1.6)
great_pyramid()
muon_rain(NF, n=40, area=(-120, 120, -120, 120), groups=4, strength=4.0)
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.crane((-160, -210, 30), (0, 0, 150), dz=40, dlook=60), 28, fstop=11, focus=280.0)
go(cam, NF, a, sc, meter=NF // 2)
