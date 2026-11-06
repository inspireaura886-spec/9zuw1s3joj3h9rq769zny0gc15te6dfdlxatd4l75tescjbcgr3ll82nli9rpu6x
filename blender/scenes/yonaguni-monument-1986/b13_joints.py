"""yonaguni b13_joints (MEDIUM-WIDE 30 mm, push-in; VO 'and this is earthquake country: quakes crack it into right angles.'). One thick layer splits along vertical joints into right-angled blocks that part slowly (eased; camera smooth).
NF default 133 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=28, half=220, sun_az=110, sun_elev=62, sun_strength=5.0, density=0.026, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
sea_floor(28.0, 440.0)
st = sandstone_mat('JointStone', algae=0.3)
slab('Under', (0, 0, -26.0), (16, 12, 2.0), st, bev=0.15, rough=0.15)
blocks = []
for i, x in enumerate((-3.0, 3.0)):
    for j, y in enumerate((-2.25, 2.25)):
        b_ = slab('Blk%d%d' % (i, j), (x, y, -23.98), (5.98, 4.48, 2.0), st, bev=0.08, rough=0.08)
        for f, k in ((0, 0.0), (int(NF * 0.2), 0.0), (NF, 1.0)):
            b_.location = (x * (1 + 0.09 * k), y * (1 + 0.13 * k), -23.98)
            b_.keyframe_insert('location', frame=f)
cam = C.Cam(clip_end=800)
cam.shot(0, NF, C.push_in((-10, -15, -16.5), (0, 0, -24), amount=0.18), lens=30, fstop=6.3, focus=18.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.21)
