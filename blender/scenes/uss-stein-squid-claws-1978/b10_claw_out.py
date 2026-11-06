"""uss-stein-squid-claws-1978 b10_claw_out (35 mm, crane up; VO 'and it looked to him like a claw.'): Medium: the hook lifts out of the cut on the blade tip into the work light; dome curve behind.
NF default 101 = 8 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=False, glare=0.35)
kz = drydock(NF)
ship, dome = frigate()
ship.location = (0, 0, 7.5 + kz)
bpy.context.view_layer.update()
D = dome_point(dome, 0.25, -0.1, 0.004)
cl = claw('OutClaw', D, size=0.05, yaw=10)
key_loc(cl, [(0, tuple(D)), (int(NF * 0.3), tuple(D)), (NF, tuple(D + Vector((-0.3, -0.25, 0.25))))])
k = knife('Knife', D + Vector((-0.12, -0.04, -0.04)), rot=(0, math.radians(20), math.radians(-70)))
key_loc(k, [(0, tuple(D + Vector((-0.12, -0.04, -0.04)))), (int(NF * 0.3), tuple(D + Vector((-0.12, -0.04, -0.04)))), (NF, tuple(D + Vector((-0.42, -0.29, 0.21))))])
CN.practical('Torch', tuple(D + Vector((-0.9, -0.9, 0.9))), tuple(D), power=60, cone=45)
cam = C.Cam(clip_end=200)
ease_cam(cam, NF, C.crane(D + Vector((-1.4, -0.9, -0.1)), D + Vector((-0.2, -0.1, 0.1)), dz=0.35, dlook=0.15), 35, fstop=5.6, focus=1.6)
go(cam, NF, a, sc, meter=NF // 2)
