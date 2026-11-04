"""lakenheath b06 (L8 'Venom crews saw only a stationary blip, no chase'): one blip barely moving; low angle."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 172, int)
blips = [((0.12, -0.12), (0.11, -0.115), 3.6)]
sc = radar_set(NF, blips, t0=T0 + 1.7)
cam = C.Cam()
cam.shot(0, NF, C.dolly((0.55, -0.55, 1.30), (0.42, -0.62, 1.34), look=TGT), lens=(34, 36), fstop=2.2, focus=TGT)
finish_cam(cam, NF, a, sc)
