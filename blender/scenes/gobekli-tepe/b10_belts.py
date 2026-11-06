"""gobekli-tepe b10_belts (CLOSE accent 50 mm, push-in; VO 'some carved with belts, like giant abstract people.').
3D: carved belt band on a central pillar under raking light
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(10)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
hill_site()
pit_floor(70, z=-0.4)
enclosure('A', center=(0, 0, -0.4), r=8.0, n=10, h=4.5)
enclosure('B', center=(22, 12, -0.4), r=6.5, n=8, h=4.0, seed=2)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.push_in((-1.5, -3.4, 2.4), (-1.5, 0, 1.9), amount=0.25), lens=50, fstop=4.0, focus=3.3)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
