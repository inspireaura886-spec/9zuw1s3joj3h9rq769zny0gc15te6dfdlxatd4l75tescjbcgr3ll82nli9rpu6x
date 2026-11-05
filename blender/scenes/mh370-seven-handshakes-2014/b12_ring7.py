"""mh370 b12 (MEDIUM 50 mm, VO 'The seventh reply, at 8:19 a.m., was the last.'): same globe, closer: rings 1-6 dim,
ring 7 draws across the southern Indian Ocean and flares. Slow push in to the arc. NF default 120."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 120, int)
sc = core.reset(); look(sc, vol=False, glare=0.55, vignette=0.22)
Wd.hdri('qwantani_night_puresky', strength=0.0, bg_strength=0.18, rot=30)
earth('Earth')
P0 = lonlat(SUB_LON, 0)
CN.sun(elev=-12, az=95, warmth='noon', strength=5.0, check=False)
for k in range(6):
    m = glow_mat('RingM%d' % k, (0.55, 0.9, 1.0), 4.0)
    curve_poly('Ring%d' % k, small_circle(P0, RING_RHO[k]), bevel=0.18, mat=m)
    key_fac(m, [(0, 0.45)])
m7 = glow_mat('Ring7M', (0.75, 0.95, 1.0), 6.0)
r7 = curve_poly('Ring7', small_circle(P0, RING_RHO[6]), bevel=0.26, mat=m7)
grow_curve(r7, [(0, 0.0), (8, 0.0), (44, 1.0)])
key_strength(m7, [(0, 6.0), (44, 6.0), (52, 22.0), (70, 12.0), (NF, 10.0)])
cam = C.Cam(clip_end=5000)
foc = lonlat(90, -36)
cam.shot(0, NF, C.dolly(lonlat(86, -48, 330), lonlat(88, -46, 285), look=foc), lens=50, fstop=11, focus=foc)
go(cam, NF, a, sc, meter=NF - 10, target=0.2)
