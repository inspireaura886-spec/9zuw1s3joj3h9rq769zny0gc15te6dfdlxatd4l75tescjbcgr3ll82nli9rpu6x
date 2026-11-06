"""uss-omaha-spherical-uap-2019 b14_surface (35 mm, slow push; VO 'Something went into the ocean.'): Night sea surface, medium: last faint ripple rings spreading where it went in, moonlight on the swell.
NF default 66 = 5 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 66, int)
sc = core.reset(); look(sc, vol=False, glare=0.4)
night_sea(NF, moon=2.0)
ripples(NF, (0, 60, 0), f0=0, n=3, rmax=18)
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.push_in((-18, 18, 7), (0, 60, 0), amount=0.2), 35, fstop=8, focus=45.0)
go(cam, NF, a, sc, meter=NF // 2)
