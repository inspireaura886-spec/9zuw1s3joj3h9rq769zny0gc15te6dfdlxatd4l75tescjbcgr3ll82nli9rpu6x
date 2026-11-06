"""nazca-lines-peru-2024 b15_giant (24 mm, crane up (ground to sky); VO 'So who were the giant ones for?'): From the ground beside a pale line, crane straight up until the full hummingbird resolves below.
NF default 89 = 7 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
pampa(NF, sun_az=80, elev=40)
hummingbird(loc=(0, 30, 0))
long_lines(n=4)
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.dolly((-30, -40, 3), (-25, -70, 180), look=(0, 0, 0), look1=(0, 30, 0)), 24, fstop=11, focus=150.0)
go(cam, NF, a, sc, meter=NF // 2)
