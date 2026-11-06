"""nazca-lines-peru-2024 b05_scale (24 mm, orbit; VO 'some longer than three football fields.'): Very high orbit: figures as small marks, long straight lines crossing kilometres of pampa.
NF default 78 = 6 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 78, int)
sc = core.reset(); look(sc, vol=True, glare=0.3)
pampa(NF, sun_az=80, elev=50)
hummingbird(loc=(0, 0, 0), scale=1.6, w=2.0)
monkey(loc=(260, 220, 0), scale=1.4, w=1.6)
long_lines(n=9, seed=4, L=(1500, 3500))
cam = C.Cam(clip_end=30000)
ease_cam(cam, NF, C.orbit((0, 0, 0), r=700, a0=250, a1=275, h=(620, 600), look_h=0), 24, fstop=11, focus=900.0)
go(cam, NF, a, sc, meter=NF // 2)
