"""usa-32-farrah-2026 b10_shotdown (28 mm, slow push-in; VO 'Online, people asked if it was shot down on purpose. No government has said that.'): WIDE: a thin ghost line climbs from the surface toward the satellite, stops short and dissolves; the satellite turns on, untouched.
NF default 181 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 181, int)
sc = core.reset(); look(sc, vol=False, glare=0.4)
space(sun_az=120); earth()
root, parts = satellite('USA32', (0, 0, 0), spin_deg=20, NF=NF)
gm = glow_mat('ShotM', (0.75, 0.85, 1.0), 3.0)
ln = curve_poly('Shot', [(40, 30, -198), (30, 22, -120), (22, 14, -60), (14, 8, -22)], bevel=0.3, mat=gm)
grow_curve(ln, [(0, 0.0), (int(NF * 0.55), 1.0), (NF, 1.0)])
key_fac(gm, [(0, 1.0), (int(NF * 0.55), 1.0), (int(NF * 0.8), 0.0)])
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.push_in((-36, -70, -34), (6, 0, -60), amount=0.12), 28, fstop=11, focus=80.0)
go(cam, NF, a, sc, meter=NF // 2)
