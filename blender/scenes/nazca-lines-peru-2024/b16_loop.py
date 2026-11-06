"""nazca-lines-peru-2024 b16_loop (28 mm, slow push; VO 'Nobody explained it.'): High aerial of the hummingbird at dusk, long shadows, slow push (loops to the artifact photo).
NF default 75 = 3 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
pampa(NF, sun_az=270, elev=4, warmth='late')
hummingbird(loc=(0, 0, 0))
long_lines(n=4)
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.push_in((-30, -200, 220), (0, 0, 0), amount=0.15), 28, fstop=11, focus=300.0)
go(cam, NF, a, sc, meter=NF // 2)
