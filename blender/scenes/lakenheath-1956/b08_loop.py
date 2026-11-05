"""lakenheath b08 (L10 end question): scope shot, ends on the exact frame-0 hook framing (loop seam into b01)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 231, int)
cut = arg(a, '--cut', 110, int)
t0 = T0 - NF / 30.0
while t0 < -8: t0 += 4.0
blips = [((-0.28, 0.28), (-0.30, 0.30), 3.8), ((0.25, 0.21), (0.24, 0.20), 3.0)]
sc = radar_set(NF, blips, t0=t0)
cam = C.Cam()
cam.shot(0, cut, C.dolly((0.55, -0.55, 1.30), (0.45, -0.62, 1.34), look=TGT), lens=(34, 36), fstop=2.2, focus=TGT)
cam.shot(cut, NF, C.dolly((0.10, -0.36, 1.40), HOOK_POS, look=TGT, ease=C.smooth), lens=(48, HOOK_LENS), fstop=2.4, focus=TGT)
finish_cam(cam, NF, a, sc)
