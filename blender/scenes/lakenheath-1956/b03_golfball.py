"""b03: Lakenheath ground view: golf-ball lights shrink to pinpoints"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 119
setup(sc, exposure=1.1, vol=True, glare=0.5)
night_air(NF, coverage=0.4)
Wd.box('Ground', (0, 0, -3), (30000, 30000, 1))
o = Md.orb('Ball', (0, 0, 0), color=(1.0, 0.95, 0.85), strength=120, power=3e4, radius=3.0, halo=1.0, pulse=0.04, f1=NF, seed=4)
Md.fly(o, [(0, (0, 250, 120), (0, 0, 0)), (NF, (400, 4000, 700), (0, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.dolly((-30, -40, 3), (-20, -30, 4), look=(60, 800, 200)), lens=(30, 38), fstop=8, focus=(60, 800, 200))
finish_cam(cam, NF, a, sc)
