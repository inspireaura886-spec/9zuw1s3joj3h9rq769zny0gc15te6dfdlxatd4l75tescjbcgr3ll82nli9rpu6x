"""uss-omaha-spherical-uap-2019 b11_hour (24 mm, lateral dolly; VO 'and that it had flown for about an hour.'): Night wide: the trimaran under way, a dark sphere pacing far above-left against the stars.
NF default 112 = 9 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 112, int)
sc = core.reset(); look(sc, vol=False, glare=0.45)
night_sea(NF)
ship = lcs()
key_loc(ship, [(0, (0, 300, 0)), (NF, (0, 330, 0))], interp='LINEAR')
sp = dark_sphere(loc=(-80, 330, 60), r=1.5)
key_loc(sp, [(0, (-80, 300, 60)), (NF, (-80, 330, 60))], interp='LINEAR')
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.dolly((-230, 80, 10), (-215, 110, 12), look=(-20, 320, 20)), 24, fstop=11, focus=320.0)
go(cam, NF, a, sc, meter=NF // 2)
