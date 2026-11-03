"""nimitz plate b01 (235 f): hook: Nov 14 2004, Pacific dusk, fighter pair banks over the sea (frame 0 = strongest image: tic-tac glint far below)"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 235
setup(sc, exposure=1.0, vol=True, glare=0.25)
dusk_sea(NF, hdri_rot=60, sea_center=(0, 100, 0), sea_half=5000.0)
j1 = Md.fighter('F1', f1=NF, burner=0.0); j2 = Md.fighter('F2', f1=NF, burner=0.0, seed=9)
Md.fly(j1, [(0, (0, -400, 900), (0, 0, 0)), (NF, (0, 600, 900), (0, 0, 0))], interp='LINEAR')
Md.fly(j2, [(0, (90, -440, 920), (0, 0, 0)), (NF, (90, 560, 920), (0, 0, 0))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
cam.shot(0, 120, C.track('F1', offset=(-60, -90, 14), offset1=(-45, -40, 8), look_offset=(0, 10, 0)), lens=(40, 46), fstop=8, focus='F1')
cam.shot(120, NF, C.track('F1', offset=(40, 80, 6), offset1=(30, 60, 4), look_offset=(0, -20, 0)), lens=(35, 38), fstop=8, focus='F1')
finish_cam(cam, NF, a, sc)
