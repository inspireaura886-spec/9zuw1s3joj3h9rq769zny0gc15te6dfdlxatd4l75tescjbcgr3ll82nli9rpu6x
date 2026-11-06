"""usa-32-farrah-2026 b03_tracking (24 mm, lateral dolly; VO 'On September thirteenth, the Space Force confirmed it had fragmented,'): WIDE: amber orbit ring drawn on over the dark Earth; the single marker travelling it splits into three at ~2.7 s.
NF default 123 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 123, int)
sc = core.reset(); look(sc, vol=False, glare=0.5, vignette=0.26)
space(sun_elev=12, sun_strength=1.2); earth(dark=True)
orbit_ring('Orbit', grow=(2, 40), NF=NF)
m0 = marker('Trk', orbit_point(88), r=2.4)
key_loc(m0, [(0, orbit_point(88)), (int(NF * 0.62), orbit_point(90.6)), (NF, orbit_point(91.4))])
for k in range(3):
    mk = marker('Frag%d' % k, orbit_point(90.6), r=1.5, color=(1.0, 0.82, 0.55))
    f1 = int(NF * 0.62)
    for f, s in ((0, 0.01), (f1, 0.01), (f1 + 3, 1.0)):
        mk.scale = (s, s, s)
        mk.keyframe_insert('scale', frame=f)
    key_loc(mk, [(f1, orbit_point(90.6)), (NF, orbit_point(90.6 + (k - 1) * 0.35) + Vector((0, 0, (k - 1) * 14)))])
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.dolly((-110, -150, 70), (90, -150, 60), look=Vector((0, 0, 0)), look1=Vector((0, 0, 0))), 24, fstop=11, focus=190.0)
go(cam, NF, a, sc, meter=NF // 2)
