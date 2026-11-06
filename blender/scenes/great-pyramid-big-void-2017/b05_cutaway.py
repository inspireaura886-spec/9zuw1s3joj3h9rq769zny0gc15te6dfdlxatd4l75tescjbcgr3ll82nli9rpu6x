"""great-pyramid-big-void-2017 b05_cutaway (30 mm, push-in; VO 'and empty space lets more of them through.'): E-W section of the pyramid (east half removed): known passages as dark recesses, streaks pass the cut face; more streaks where space is empty.
NF default 101 = 8 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=False, glare=0.4)
desert(NF, sun_az=200, elev=25, haze=False)
great_pyramid(cut=True)
H = interior_section()
muon_rain(NF, n=60, area=(-1, -0.5, -110, 110), groups=5, through=(H['void'], 12), bevel=0.15)
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.push_in((-240, 0, 70), (0, 0, 55), amount=0.22), 30, fstop=11, focus=230.0)
go(cam, NF, a, sc, meter=NF // 2)
