"""uss-stein-squid-claws-1978 b15_never_found (28 mm, dolly into the dark; VO 'The animal was never found.'): Empty blue-black water, a beam of light fading, motes drifting; dolly forward into nothing.
NF default 66 = 5 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 66, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
underwater(depth_fog=0.06, color=(0.04, 0.1, 0.15), surface_z=150.0)
b = Wd.spot('Beam', (-20, 0, 60), (0, 80, -10), color=(0.6, 0.85, 1.0), power=250000, size_deg=16, blend=0.7)
b.data.keyframe_insert('energy', frame=0)
b.data.energy = 30000
b.data.keyframe_insert('energy', frame=NF)
cam = C.Cam(clip_end=2000)
ease_cam(cam, NF, C.dolly((0, 0, 0), (0, 14, -2), look=(0, 80, -10)), 28, fstop=8, focus=60.0)
go(cam, NF, a, sc, meter=NF // 2)
