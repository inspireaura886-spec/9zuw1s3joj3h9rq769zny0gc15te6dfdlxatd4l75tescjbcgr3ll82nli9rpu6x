"""nimitz plate b09 (138 f): loop: ends on b01's frame-0 composition (fighter pair over dusk sea, tic-tac glint)"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 138
setup(sc, exposure=1.2, vol=True, glare=0.6)
dusk_sea(NF, hdri_rot=60)
j1 = Md.fighter('F1', f1=NF, burner=0.0)
Md.fly(j1, [(0, (0, -400, 900), (0, 0, 0)), (NF, (0, 600, 900), (0, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.track('F1', offset=(60, 90, 10), offset1=(-60, -90, 14), look_offset=(0, 10, 0)), lens=(40, 40), fstop=8, focus='F1')
finish_cam(cam, NF, a, sc)
