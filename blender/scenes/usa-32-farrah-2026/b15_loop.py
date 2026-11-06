"""usa-32-farrah-2026 b15_loop (28 mm, slow push; VO 'Nobody explained it.'): WIDE (loop): the limb and the empty orbit ring with a few drifting shards, no satellite left; slow push toward the empty spot.
NF default 75 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
sc = core.reset(); look(sc, vol=False, glare=0.3, vignette=0.3)
space(sun_az=120); earth()
orbit_ring('Orbit', strength=1.2, NF=NF)
shards(60, (0, 0, 0), 0, NF, spread=120.0, size=0.6, seed=61, along=Vector((1, 0, 0)), speed=0.5)
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.push_in((-6, -60, 8), (0, 0, -2), amount=0.14), 28, fstop=11, focus=60.0)
go(cam, NF, a, sc, meter=NF // 2)
