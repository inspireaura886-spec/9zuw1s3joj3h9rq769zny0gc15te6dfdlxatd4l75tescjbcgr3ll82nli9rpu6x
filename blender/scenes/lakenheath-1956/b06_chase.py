"""b06: chase: light shadows the fighter"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 89
setup(sc, exposure=1.1, vol=True, glare=0.5)
night_air(NF, coverage=0.4)
j = Md.fighter('F1', f1=NF, burner=1.0)
Md.fly(j, [(0, (0, -500, 300), (0, 0, 0)), (NF, (300, 500, 320), (0, 0, -25))], interp='LINEAR')
o = Md.orb('Light', (0, 0, 0), color=(1.0, 0.97, 0.9), strength=80, power=2e4, radius=1.5, halo=1.0, pulse=0.05, f1=NF, seed=5)
Md.fly(o, [(0, (0, -560, 305), (0, 0, 0)), (NF, (300, 440, 322), (0, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.track('F1', offset=(60, 90, 14), offset1=(45, 50, 8), look_offset=(0, -20, 0)), lens=(40, 44), fstop=8, focus='F1')
finish_cam(cam, NF, a, sc)
