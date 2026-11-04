"""b10: loop: back to b01 scope composition"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
import bpy, math
a = core.args(); sc = core.reset(); NF = 198
setup(sc, exposure=0.95, vol=False, glare=0.6, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.02)
blips = [((0.30, 0.30), (0.30, 0.02), 1.5), ((0.40, 0.28), (0.20, 0.30), 6.0)]
I.radar_room(frames=NF, blips=blips, seed=10, haze=0.02, t0=-0.6)
tgt = (0.06, 0.04, 1.03)
cam = C.Cam()
cam.shot(0, NF//2, C.dolly((0.14, -0.5, 1.46), (0.1, -0.4, 1.4), look=tgt), lens=(36, 40), fstop=2.2, focus=tgt)
cam.shot(NF//2, NF, C.dolly((0.4, -0.95, 1.8), (0.4, -0.95, 1.8), look=(0.08, 0.06, 1.03)), lens=(48, 54), fstop=1.8, focus=(0.08, 0.06, 1.03))
finish_cam(cam, NF, a, sc)
