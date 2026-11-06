"""gobekli-tepe b06_blocks (MEDIUM-WIDE 35 mm, push-in; VO 'past limestone blocks that farmers had tried to break up as ordinary rocks.').
3D: cracked limestone blocks among field stones (farmers had tried to break some up, per Wikipedia)
NF default 156 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 156, int)
random.seed(6)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
lm = lime_mat()
for k in range(9):
    megalith('Blk%d' % k, (random.uniform(-6, 6), random.uniform(-3, 5), 0.2), (random.uniform(0.6, 1.6), random.uniform(0.4, 1.0), 0.5), lm, rz=random.uniform(0, 180), rx=random.uniform(-8, 8), bev=0.08, rough=0.15)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.push_in((-3, -9, 1.6), (0, 1, 0.2), amount=0.25), lens=35, fstop=5.6, focus=9.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.27)
