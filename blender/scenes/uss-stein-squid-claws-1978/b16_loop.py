"""uss-stein-squid-claws-1978 b16_loop (35 mm, slow push; VO 'Nobody explained it.'): Back in the dock: medium on the slashed dome with its hooks, light dims (loops to the hook).
NF default 75 = 3 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
sc = core.reset(); look(sc, vol=True, glare=0.3)
kz = drydock(NF)
ship, dome = frigate()
ship.location = (0, 0, 7.5 + kz)
bpy.context.view_layer.update()
slashes(dome, n=26, seed=13)
D = dome_point(dome, 0.2, 0.0)
cam = C.Cam(clip_end=500)
ease_cam(cam, NF, C.push_in(D + Vector((-7.5, -3.0, 0.8)), D, amount=0.2), 35, fstop=5.6, focus=8.0)
go(cam, NF, a, sc, meter=NF // 2)
