"""uss-stein-squid-claws-1978 b09_knife (50 mm, push-in (close accent); VO 'He dug into the rubber with his knife,'): Close: knife blade easing into a cut in the black rubber, torch light; no hand detail beyond the handle.
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
curve_poly('KCut', [tuple(dome_point(dome, 0.25 + 0.03 * t, -0.1 + 0.08 * t, 0.003)) for t in range(-4, 5)], bevel=0.02, mat=mat_once('CutDark', base=(0.008, 0.007, 0.007), rough=0.9))
k = knife('Knife', D + Vector((-0.25, -0.05, -0.05)), rot=(0, math.radians(20), math.radians(-70)))
key_loc(k, [(0, tuple(D + Vector((-0.28, -0.06, -0.06)))), (NF, tuple(D + Vector((-0.12, -0.02, -0.02))))])
CN.practical('Torch', tuple(D + Vector((-0.7, -0.5, 0.5))), tuple(D), power=40, cone=40)
cam = C.Cam(clip_end=200)
ease_cam(cam, NF, C.push_in(D + Vector((-0.6, -0.5, 0.15)), D, amount=0.18), 50, fstop=4.0, focus=0.75)
go(cam, NF, a, sc, meter=NF // 2)
