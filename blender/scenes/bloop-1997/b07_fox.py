"""bloop-1997 b07_fox (MEDIUM 35 mm, push-in; VO 'NOAA scientist Christopher Fox told a magazine it sounded alive,').
MOMENT, told slower: an empty desk chair and headphones at the console, the trace rising on the screen (no likeness of Fox); chip "Christopher Fox, NOAA - New Scientist, 2002"
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(7)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
listening_room(NF, hero_img='artifact_bloop.jpg', n_desks=4, lamp=True, trace=True)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.push_in((1.4, -2.2, 1.3), (0.4, 0, 1.0), amount=0.3), lens=35, fstop=3.5, focus=2.4)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
