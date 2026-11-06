"""shroud-of-turin b08_records (WIDE 28 mm, crane down; VO 'close to when it first appears in records.').
3D: archive desk with old document pages beside the photo print; chip "first certain record: 1350s"
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(8)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_pia1898.jpg', lamp_color=(1.0, 0.62, 0.42))
pg = M.principled('OldPage', base=(0.78, 0.7, 0.55), rough=0.85, rough_noise=0.3)
for k in range(4):
    boxm('Doc%d' % k, (-0.6 + 0.05 * k, 0.1 + 0.03 * k, 0.75 + 0.002 * k), (0.25, 0.33, 0.001), pg)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.crane((-0.6, -1.5, 1.9), (-0.4, 0.1, 0.75), dz=-0.35, dlook=0), lens=28, fstop=4.0, focus=1.7)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
