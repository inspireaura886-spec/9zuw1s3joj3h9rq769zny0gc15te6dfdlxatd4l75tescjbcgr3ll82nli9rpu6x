"""uss-stein-squid-claws-1978 b05_cuts (35 mm, push-in; VO 'Inside nearly every cut, a curved hook.'): Medium on the dome flank: ragged cuts in the black rubber, small amber hooks lodged in most of them.
NF default 89 = 7 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=True, glare=0.3)
kz = drydock(NF)
ship, dome = frigate()
ship.location = (0, 0, 7.5 + kz)
bpy.context.view_layer.update()
cuts = slashes(dome, n=26)
D = dome_point(dome, 0.35, 0.2)
cam = C.Cam(clip_end=500)
ease_cam(cam, NF, C.push_in(D + Vector((-4.2, -1.0, 0.6)), D, amount=0.25), 35, fstop=5.6, focus=4.0)
go(cam, NF, a, sc, meter=NF // 2)
