"""uss-omaha-spherical-uap-2019 b03_sea_night (24 mm, low lateral dolly; VO 'In July 2019, off San Diego,'): Moonlit Pacific swell at night, the trimaran far off with nav lights, a glitter path.
NF default 78 = 6 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 78, int)
sc = core.reset(); look(sc, vol=False, glare=0.45)
night_sea(NF)
ship = lcs()
ship.location = (0, 420, 0)
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.dolly((-60, -40, 6), (-30, -55, 7), look=(0, 420, 8)), 24, fstop=11, focus=450.0)
go(cam, NF, a, sc, meter=NF // 2)
