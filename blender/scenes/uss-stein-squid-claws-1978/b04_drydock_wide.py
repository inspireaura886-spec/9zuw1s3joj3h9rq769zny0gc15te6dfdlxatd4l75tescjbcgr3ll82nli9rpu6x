"""uss-stein-squid-claws-1978 b04_drydock_wide (24 mm, crane down; VO 'In dry dock, the rubber was slashed. Eight percent of it, cut open.'): Graving dock wide: the frigate on keel blocks, bow dome exposed above the floor, cuts visible as dark streaks; crane down from the quay.
NF default 158 = 13 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 158, int)
sc = core.reset(); look(sc, vol=True, glare=0.3)
kz = drydock(NF)
ship, dome = frigate(keel_z=-7.5)
ship.location = (0, 0, 7.5 + kz)
bpy.context.view_layer.update()
slashes(dome, n=26, claws=False)
cam = C.Cam(clip_end=2000)
ease_cam(cam, NF, C.crane((-28, 112, 22), (0, 50, 3), dz=-10, dlook=-1), 24, fstop=8, focus=70.0)
go(cam, NF, a, sc, meter=NF // 2)
