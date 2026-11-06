"""uss-stein-squid-claws-1978 b06_hook (50 mm, slow push (close accent); VO "The kind that rings a squid's suckers."): Close: one hook in a cut, keratin catching a work light; very slow push.
NF default 89 = 7 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=False, glare=0.35)
kz = drydock(NF)
ship, dome = frigate()
ship.location = (0, 0, 7.5 + kz)
bpy.context.view_layer.update()
D = dome_point(dome, 0.3, 0.1, 0.004)
claw('HeroClaw', D, size=0.05, yaw=30)
curve_poly('HeroCut', [tuple(dome_point(dome, 0.3 + 0.03 * t, 0.1 + 0.08 * t, 0.003)) for t in range(-4, 5)], bevel=0.018, mat=mat_once('CutDark', base=(0.008, 0.007, 0.007), rough=0.9))
CN.practical('Torch', tuple(D + Vector((-0.6, -0.6, 0.6))), tuple(D), power=40, cone=40)
cam = C.Cam(clip_end=200)
ease_cam(cam, NF, C.push_in(D + Vector((-0.55, -0.15, 0.12)), D, amount=0.2), 50, fstop=4.0, focus=0.55)
go(cam, NF, a, sc, meter=NF // 2)
