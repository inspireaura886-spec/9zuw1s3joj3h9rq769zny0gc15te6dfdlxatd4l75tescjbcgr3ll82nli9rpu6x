"""nazca-lines-peru-2024 b10_six_months (28 mm, push-in; VO 'In six months it led them to three hundred and three new ones.'): Aerial over the grid: hit cells spread fast across the plain, each over a small faint new figure.
NF default 158 = 13 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 158, int)
sc = core.reset(); look(sc, vol=True, glare=0.4)
pampa(NF, sun_az=70, elev=30)
rr = random.Random(8)
hits = []
for k in range(22):
    i, j = rr.randrange(10), rr.randrange(10)
    hits.append((i, j))
    slope_figure('New%d' % k, ['orca', 'human', 'llama'][k % 3], (-300 + i * 60 + 30, -300 + j * 60 + 30, 0), scale=1.4, tilt=0, yaw=rr.uniform(0, 360), w=0.6)
ai_grid(NF, n=10, cell=60, hits=hits, f_on=0.05, f_all=0.8)
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.push_in((-160, -520, 300), (0, 0, 0), amount=0.2), 28, fstop=11, focus=600.0)
go(cam, NF, a, sc, meter=NF // 2)
