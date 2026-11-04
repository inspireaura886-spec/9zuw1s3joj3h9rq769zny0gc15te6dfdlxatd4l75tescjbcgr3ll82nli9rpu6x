"""lakenheath b07 (L9 'Skeptics blamed Perseid meteors and false echoes. Condon: genuine unknown fairly probable'):
open night sky, three short meteor streaks, slow tilt up."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 223, int)
sc = night_country(NF, exposure=1.2)
for i, (st, p0, p1) in enumerate([(30, (-1500, 3500, 900), (-600, 3500, 650)), (95, (900, 4000, 1100), (1800, 4000, 800)), (160, (-300, 3800, 1000), (500, 3800, 760))]):
    o = Md.orb('Met%d' % i, p0, color=(0.9, 0.95, 1.0), strength=40, power=2e5, radius=3, halo=0.7, pulse=0.0, f1=NF, seed=i + 7)
    Md.fly(o, [(0, p0, None), (st, p0, None), (st + 12, p1, None), (NF, p1, None)], interp='LINEAR')
cam = C.Cam(clip_end=90000)
cam.shot(0, NF, C.dolly((0, 0, 0), (0, 40, 2), look=(0, 3500, 300), look1=(0, 3500, 800)), lens=(30, 34), fstop=8, focus=(0, 3500, 600))
finish_cam(cam, NF, a, sc)
