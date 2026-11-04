"""b04: RAF Venom scrambled to intercept"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 92
setup(sc, exposure=1.1, vol=True, glare=0.5)
night_air(NF, coverage=0.4)
j = Md.fighter('F1', f1=NF, burner=1.0)
Md.fly(j, [(0, (0, -500, 300), (0, 0, 0)), (NF, (0, 500, 330), (4, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.track('F1', offset=(-50, -80, 12), offset1=(-35, -45, 6), look_offset=(0, 10, 0)), lens=(40, 46), fstop=8, focus='F1')
finish_cam(cam, NF, a, sc)
