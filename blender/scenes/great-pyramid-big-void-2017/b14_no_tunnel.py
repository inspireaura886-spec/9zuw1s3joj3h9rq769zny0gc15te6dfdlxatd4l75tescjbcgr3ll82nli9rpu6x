"""great-pyramid-big-void-2017 b14_no_tunnel (28 mm, crane back; VO 'No tunnel reaches it. No camera has been inside.'): Section view, the void glowing alone above the gallery with no passage reaching it; camera cranes back and up.
NF default 112 = 9 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 112, int)
sc = core.reset(); look(sc, vol=False, glare=0.5)
desert(NF, sun_az=200, elev=20, haze=False, strength=3.0)
great_pyramid(cut=True)
H = interior_section()
mv = big_void()
key_fac(mv[0], [(0, 0.8), (NF, 1.0)])
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.dolly((-95, -4, 56), (-190, -4, 80), look=H['void'], look1=(0, 0, 60)), 28, fstop=11, focus=120.0)
go(cam, NF, a, sc, meter=NF // 2)
