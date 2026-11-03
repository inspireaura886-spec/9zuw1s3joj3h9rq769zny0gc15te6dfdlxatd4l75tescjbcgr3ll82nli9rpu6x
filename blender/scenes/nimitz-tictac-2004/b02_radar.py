"""nimitz plate b02 (256 f): USS Princeton radar week: dark CIC radar scope, blips dropping fast"""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); sc = core.reset(); NF = 256
setup(sc, exposure=0.95, vol=False, glare=0.6, vignette=0.45)
Wd.hdri('moonless_golf', strength=0.02)
blips = [((0.30, 0.30), (0.30, 0.02), 3.0), ((0.42, 0.28), (0.42, 0.04), 3.5), ((0.20, 0.18), (0.21, 0.05), 3.0)]
I.radar_room(frames=NF, blips=blips, seed=5, haze=0.02, t0=-0.6)
tgt = (0.06, 0.04, 1.03)
cam = C.Cam()
cam.shot(0, 130, C.dolly((0.40, -0.95, 1.80), (0.28, -0.75, 1.66), look=tgt), lens=(36, 40), fstop=2.2, focus=tgt)
cam.shot(130, NF, C.dolly((0.14, -0.50, 1.46), (0.10, -0.40, 1.40), look=(0.08, 0.06, 1.03)), lens=(48, 54), fstop=1.8, focus=(0.08, 0.06, 1.03))
finish_cam(cam, NF, a, sc)
