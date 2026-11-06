"""bloop-1997 b04_station (WIDE 24 mm, eased dolly; VO 'Scientists named it the Bloop.').
3D: the whole empty listening room, screens lit; chip "NOAA PMEL, 1997"
NF default 64 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 64, int)
random.seed(4)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
listening_room(NF, hero_img='artifact_bloop.jpg', n_desks=4, lamp=True, trace=True)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.dolly((-4.5, -5.5, 1.8), (-2.5, -6.0, 1.8), look=(0, 0, 1.1), look1=(0.5, 0, 1.1)), lens=24, fstop=5.6, focus=6.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
