"""b02: C-47 pilot and observers see fast white light"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 210
setup(sc, exposure=1.1, vol=True, glare=0.5)
night_air(NF, coverage=0.4)
o = Md.orb('Light', (0, 0, 0), color=(1.0, 0.97, 0.9), strength=80, power=6e4, radius=2.5, halo=1.0, pulse=0.05, f1=NF, seed=3)
Md.fly(o, [(0, (-900, 400, 80), (0, 0, 0)), (NF, (900, 1400, 260), (0, 0, 0))], interp='LINEAR')
j = Md.fighter('F1', f1=NF, burner=0.0)
Md.fly(j, [(0, (-300, -600, 150), (0, 0, 0)), (NF, (600, 600, 160), (0, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, NF//2, C.track('Light', offset=(-200, -300, 40), offset1=(-150, -250, 30), look_offset=(0, 0, 0)), lens=(35, 40), fstop=8, focus='Light')
cam.shot(NF//2, NF, C.track('F1', offset=(80, -150, 20), offset1=(60, -110, 12), look_offset=(0, 10, 0)), lens=(40, 46), fstop=8, focus='F1')
finish_cam(cam, NF, a, sc)
