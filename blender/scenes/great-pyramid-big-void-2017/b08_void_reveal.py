"""great-pyramid-big-void-2017 b08_void_reveal (30 mm, slow push; VO 'A void, at least thirty metres long.'): Section view: the Big Void fades in above the Grand Gallery as a cool glow (horizontal hypothesis).
NF default 89 = 7 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=False, glare=0.5)
desert(NF, sun_az=200, elev=25, haze=False)
great_pyramid(cut=True)
H = interior_section()
mv = big_void()
key_fac(mv[0], [(0, 0.0), (int(NF * 0.35), 1.0)])
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.push_in((-150, -4, 60), H['void'], amount=0.25), 30, fstop=11, focus=150.0)
go(cam, NF, a, sc, meter=NF // 2)
