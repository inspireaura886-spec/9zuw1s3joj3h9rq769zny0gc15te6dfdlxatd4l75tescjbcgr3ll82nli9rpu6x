"""uss-stein-squid-claws-1978 b11_gash (35 mm, dolly along the cut; VO 'He said the longest gash ran four feet.'): Medium along one long ragged slash across the dome flank (his account, chip says claim).
NF default 101 = 8 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=True, glare=0.3)
kz = drydock(NF)
ship, dome = frigate()
ship.location = (0, 0, 7.5 + kz)
bpy.context.view_layer.update()
pts = [tuple(dome_point(dome, 0.1 + 0.02 * t, 0.3 + 0.03 * t + 0.01 * math.sin(t), 0.004)) for t in range(0, 41)]
curve_poly('LongCut', pts, bevel=0.025, mat=mat_once('CutDark', base=(0.008, 0.007, 0.007), rough=0.9))
A, B = Vector(pts[0]), Vector(pts[-1])
cam = C.Cam(clip_end=500)
ease_cam(cam, NF, C.dolly(A + Vector((-2.4, -1.2, 0.6)), B + Vector((-2.4, -1.2, 0.6)), look=A, look1=B), 35, fstop=5.6, focus=2.7)
go(cam, NF, a, sc, meter=NF // 2)
