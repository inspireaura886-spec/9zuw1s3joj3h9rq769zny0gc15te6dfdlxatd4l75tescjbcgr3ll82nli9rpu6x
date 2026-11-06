"""bloop-1997 b15_close (MEDIUM-WIDE 35 mm, push-in; VO 'The monster stories still end the same way: Nobody explained it.').
3D: back in the empty listening room on the hero screen; loops to b01 (same screen, same framing)
NF default 133 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
random.seed(15)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
listening_room(NF, hero_img='artifact_bloop.jpg', n_desks=4, lamp=True, trace=True)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((-0.35, -3.0, 1.5), (0, 0, 1.25), amount=0.25), lens=35, fstop=4.0, focus=2.9)
go(cam, NF, a, sc, meter=NF // 2, target=0.22)
