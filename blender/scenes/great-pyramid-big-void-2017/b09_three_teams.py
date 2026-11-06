"""great-pyramid-big-void-2017 b09_three_teams (28 mm, lateral dolly; VO 'Three teams saw it, from three different angles.'): Section: three detector positions (two in the Queen's Chamber, one outside the north face) send faint sight lines that converge on the void.
NF default 101 = 8 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=False, glare=0.5)
desert(NF, sun_az=200, elev=25, haze=False)
great_pyramid(cut=True)
H = interior_section()
big_void()
for i, p in enumerate([Vector((-0.6, -1.5, 22)), Vector((-0.6, 1.8, 22)), Vector((-0.6, 100, 4))]):
    m = glow_mat('Sight%d' % i, (1.0, 0.85, 0.6), 4.0)
    o = curve_poly('SightL%d' % i, [tuple(p), tuple(H['void'] + Vector((-0.2, 0, 0)))], bevel=0.35, mat=m)
    f0 = int(NF * (0.1 + 0.22 * i))
    grow_curve(o, [(f0, 0.0), (f0 + 20, 1.0)])
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.dolly((-200, 30, 55), (-200, -20, 60), look=(0, 10, 40), look1=(0, -10, 45)), 28, fstop=11, focus=200.0)
go(cam, NF, a, sc, meter=NF // 2)
