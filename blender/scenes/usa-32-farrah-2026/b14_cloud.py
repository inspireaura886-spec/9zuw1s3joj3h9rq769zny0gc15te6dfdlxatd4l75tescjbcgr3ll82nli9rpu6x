"""usa-32-farrah-2026 b14_cloud (28 mm, lateral dolly; VO 'One modelling firm estimates roughly thirty-five hundred fragments bigger than a centimetre.'): WIDE: the shard cloud grows from a point into a long glittering ribbon along the orbit as the camera slides past.
NF default 146 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 146, int)
sc = core.reset(); look(sc, vol=False, glare=0.4)
space(sun_az=140, sun_elev=22); earth()
shards(560, (0, 0, 0), 0, NF, spread=340.0, size=1.0, seed=51, along=Vector((1, 0, 0)), speed=0.8)
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.dolly((-100, -80, 12), (70, -80, 8), look=Vector((0, 0, -6))), 28, fstop=11, focus=100.0)
go(cam, NF, a, sc, meter=int(NF * 0.7))
