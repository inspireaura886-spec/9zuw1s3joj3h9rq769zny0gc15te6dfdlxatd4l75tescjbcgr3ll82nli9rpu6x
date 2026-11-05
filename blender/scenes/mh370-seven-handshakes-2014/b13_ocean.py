"""mh370 b13 (WIDE 24 mm, VO 'Its ring crossed the southern Indian Ocean.' + s16 re-cut 'Malaysia has extended
the hunt...'): empty southern Indian Ocean at dawn from altitude, long swells, the 7th arc as a faint glowing line on
the water to the horizon. Slow crane DOWN. NF default 175 (77 f for b13 + 88 f re-cut for s16 + handles)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 175, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.22)
dawn_world(sun_az=62, elev=7, strength=3.5, hdri_strength=0.9)
swell_ocean(NF, half=4500, wave_scale=2.2, wind=15, color=(0.006, 0.016, 0.024))
m = glow_mat('ArcM', (0.6, 0.92, 1.0), 4.0)
pts = []
for k in range(60):
    u = k / 59
    x = -260 + 1500 * u + 500 * u * u
    y = 260 + 9000 * u ** 1.6
    pts.append((x, y, 3.2))
arc = curve_poly('Arc7', pts, bevel=3.0, mat=m)
key_fac(m, [(0, 0.55), (NF, 0.7)])
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.dolly((-60, -60, 150), (-30, -20, 64), look=(250, 2400, 0), look1=(200, 2200, 4)), lens=24, fstop=11,
         focus=1500.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.25)
