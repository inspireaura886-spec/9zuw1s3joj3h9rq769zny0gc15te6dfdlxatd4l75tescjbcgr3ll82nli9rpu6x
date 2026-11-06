"""nazca-lines-peru-2024 b08_century (24 mm, crane up; VO 'For nearly a century, researchers counted about four hundred and thirty figures.'): Aerial: many known figures and lines across the plain, each with a faint marker pin, crane rising.
NF default 147 = 12 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 147, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
pampa(NF, sun_az=80, elev=45)
rr = random.Random(2)
for k in range(9):
    p = (rr.uniform(-500, 500), rr.uniform(-400, 600), 0)
    [hummingbird, monkey, spider][k % 3]('Known%d' % k, loc=p, scale=rr.uniform(0.5, 0.9), w=1.0)
    m = glow_mat('Pin%d' % k, (0.95, 0.9, 0.8), 1.5)
    cyl('PinL%d' % k, p, (p[0], p[1], 25), 0.6, m, 8)
long_lines(n=7)
cam = C.Cam(clip_end=30000)
ease_cam(cam, NF, C.crane((-200, -700, 220), (0, 100, 0), dz=140, dlook=0), 24, fstop=11, focus=800.0)
go(cam, NF, a, sc, meter=NF // 2)
