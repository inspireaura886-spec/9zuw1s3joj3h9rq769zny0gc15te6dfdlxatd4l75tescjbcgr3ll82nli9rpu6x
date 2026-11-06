"""usa-32-farrah-2026 b02_shatter (28 mm, slow push-in; VO 'broke apart in orbit, and nobody will say why.'): WIDE: the squat gold satellite over the Earth limb flashes silently at 1.5 s and its dishes, panels and foil shards drift apart.
NF default 112 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 112, int)
sc = core.reset(); look(sc, vol=False, glare=0.4, vignette=0.22)
space(); earth()
root, parts = satellite('USA32', (0, 0, 0), spin_deg=14, NF=NF)
f0 = int(NF * 0.42)
flash('Break', (0, 0, 0), f0, NF, r0=0.5, r1=10.0)
drift_parts(parts, f0, NF, dist=16.0)
shards(110, (0, 0, 0), f0, NF, spread=34.0, size=0.3, seed=11)
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.push_in((-4, -30, 5), (0, 0, -1), amount=0.16), 28, fstop=11, focus=30.0)
go(cam, NF, a, sc, meter=int(NF * 0.7))
