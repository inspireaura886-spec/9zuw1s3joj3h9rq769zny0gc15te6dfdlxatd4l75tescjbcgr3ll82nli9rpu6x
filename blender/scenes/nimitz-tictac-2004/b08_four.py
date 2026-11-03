"""nimitz plate b08 (92 f): four trained flyers watched for five minutes: cockpit glow close on a pilot-view horizon"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 92
setup(sc, exposure=1.1, vol=True, glare=0.5)
dusk_sea(NF, hdri_rot=100)
jets = []
for i, (x, y) in enumerate([(-30, 0), (30, 20)]):
    j = Md.fighter('F%d' % i, f1=NF, burner=0.0, seed=7 + i); jets.append(j)
    Md.fly(j, [(0, (x, y, 80), (0, 0, 0)), (NF, (x, y + 120, 80), (0, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, NF, C.track('F0', offset=(-30, 60, 6), offset1=(-22, 40, 4), look_offset=(10, 0, 0)), lens=(40, 46), fstop=6, focus='F0')
finish_cam(cam, NF, a, sc)
