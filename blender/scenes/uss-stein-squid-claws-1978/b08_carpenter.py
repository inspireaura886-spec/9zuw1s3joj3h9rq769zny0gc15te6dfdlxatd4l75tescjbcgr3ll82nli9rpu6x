"""uss-stein-squid-claws-1978 b08_carpenter (28 mm, tracking dolly; VO 'A petty officer named Ira Carpenter found the first one.'): MOMENT (told slow): a lone dock worker silhouette walks the dock floor under the bow toward the dome, work lights behind.
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
kz = drydock(NF)
ship, dome = frigate()
ship.location = (0, 0, 7.5 + kz)
bpy.context.view_layer.update()
slashes(dome, n=26, claws=False)
man = worker('Carpenter', (-4, 40, 0), yaw=-10)
walk_to = (-1.5, 49, 0)
key_loc(man, [(0, (-4, 40, 0)), (NF, walk_to)], interp='LINEAR')
cam = C.Cam(clip_end=500)
ease_cam(cam, NF, C.dolly((-11, 33, 1.7), (-8.5, 41, 1.8), look=(-3.5, 44, 1.5), look1=(-1, 52, 2.2)), 28, fstop=5.6, focus=9.0)
go(cam, NF, a, sc, meter=NF // 2)
