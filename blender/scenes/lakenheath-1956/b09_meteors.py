"""b09: skeptics: Perseid meteors, false echoes"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 222
setup(sc, exposure=1.1, vol=True, glare=0.5)
night_air(NF, coverage=0.4)
for i in range(5):
    o = Md.orb('Met%d' % i, (0, 0, 0), color=(0.9, 0.95, 1.0), strength=60, power=1e4, radius=1.2, halo=1.0, pulse=0.02, f1=NF, seed=10 + i)
    Md.fly(o, [(0, (-700 + 220 * i, 1500, 900 - 40 * i), (0, 0, 0)), (NF, (-300 + 220 * i, 1500, 300 - 40 * i), (0, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.dolly((0, -80, 10), (0, -60, 14), look=(0, 1500, 500)), lens=(28, 32), fstop=8, focus=(0, 1500, 500))
finish_cam(cam, NF, a, sc)
