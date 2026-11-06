"""usa-32-farrah-2026 b08_farrah (28 mm, lateral dolly; VO 'Analysts say it was Farrah Three, built to listen to Soviet radar.'): WIDE: the satellite above the limb while pale radar pulses ripple outward on the surface far below, its three dishes tilted toward them.
NF default 135 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 135, int)
sc = core.reset(); look(sc, vol=False, glare=0.4)
space(sun_az=110); earth()
root, parts = satellite('USA32', (0, 0, 0), spin_deg=24, NF=NF)
for k in range(3):
    rm = glow_mat('Pulse%d' % k, (0.55, 0.85, 1.0), 2.5)
    rg = ring_mesh('PulseR%d' % k, 1.0, 0.04, 192)
    rg.location = (0, 20, -199.0)
    rg.data.materials.append(rm)
    f0 = k * 22
    for f, s in ((f0, 8.0), (min(NF, f0 + 90), 260.0)):
        rg.scale = (s, s, 1)
        rg.keyframe_insert('scale', frame=f)
    key_fac(rm, [(max(0, f0 - 1), 0.0), (f0, 1.0), (min(NF, f0 + 90), 0.0)])
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.dolly((-34, -30, 4), (24, -30, -2), look=Vector((0, 0, -20))), 28, fstop=11, focus=34.0)
go(cam, NF, a, sc, meter=NF // 2)
