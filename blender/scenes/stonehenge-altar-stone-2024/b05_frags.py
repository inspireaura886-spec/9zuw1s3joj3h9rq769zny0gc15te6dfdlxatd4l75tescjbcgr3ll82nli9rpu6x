"""stonehenge-altar-stone-2024 b05_frags (MEDIUM-WIDE 35 mm, push-in; VO 'The answer came from two small fragments found at the site.').
3D: two small labelled green-grey fragments in specimen trays on the desk (MS3, 2010K.240 per the paper); no faces
NF default 133 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
random.seed(5)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
desk_print(NF, 'artifact_altar.jpg', extra_prints=())
fm = rock_mat('FragM', tint=(0.36, 0.42, 0.33), tid='dry_ground_rocks', scale=2.0)
for k, x in enumerate((-0.6, -0.35)):
    boxm('Tray%d' % k, (x, -0.25, 0.755), (0.2, 0.14, 0.02), M.principled('TrayM%d' % k, base=(0.85, 0.85, 0.82), rough=0.4), 0.004)
    megalith('Frag%d' % k, (x, -0.25, 0.79), (0.07, 0.05, 0.035), fm, rz=20 * k, bev=0.01, rough=0.01)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((-0.75, -1.15, 1.3), (-0.48, -0.25, 0.77), amount=0.3), lens=35, fstop=3.5, focus='Frag0')
go(cam, NF, a, sc, meter=NF // 2, target=0.28)
