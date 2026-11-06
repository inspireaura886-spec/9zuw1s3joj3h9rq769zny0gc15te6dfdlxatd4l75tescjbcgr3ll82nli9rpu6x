"""great-pyramid-big-void-2017 b15_unknown (50 mm, push-in (close accent); VO "Nobody knows if it's one room, or what it's for."): Close on the void region: the two published shapes (horizontal, inclined) breathe in and out against each other.
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=False, glare=0.55)
desert(NF, sun_az=200, elev=20, haze=False, strength=2.0)
great_pyramid(cut=True)
H = interior_section()
mv = big_void(alt=True)
key_fac(mv[0], [(0, 1.0), (NF // 2, 0.25), (NF, 1.0)])
key_fac(mv[1], [(0, 0.2), (NF // 2, 1.0), (NF, 0.2)])
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.push_in((-70, -4, 54), H['void'], amount=0.18), 50, fstop=11, focus=70.0)
go(cam, NF, a, sc, meter=NF // 2)
