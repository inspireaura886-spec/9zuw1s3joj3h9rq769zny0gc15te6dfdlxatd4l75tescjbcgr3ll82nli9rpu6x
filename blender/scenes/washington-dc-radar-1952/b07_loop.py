"""dc-radar b07 (L7 'A Navy radar specialist said it was too weak.' + L8 'And still, nobody explained it.'):
shot A low across the console, blips still there; shot B pushes back to the exact frame-0 hook framing, blips
arriving at the hook positions with the beam in the same place = seamless loop into b01 frame 0."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 200, int)
cut = arg(a, '--cut', 100, int)
# beam phase: t(NF) == T0 (mod 4 s sweep) so the last frame matches b01 frame 0
t0 = T0 - NF / 30.0
while t0 < -8: t0 += 4.0
blips = [((x + 0.06, y - 0.07), (x, y), 3.6) for x, y in SEVEN0]
sc = radar_set(NF, blips, t0=t0)
cam = C.Cam()
cam.shot(0, cut, C.dolly((0.55, -0.55, 1.30), (0.45, -0.62, 1.34), look=TGT), lens=(34, 36), fstop=2.2, focus=TGT)
# ends exactly on HOOK_POS / HOOK_LENS (ease lands with zero velocity at the end = frame 0 of b01 starts at rest)
cam.shot(cut, NF, C.dolly((0.10, -0.36, 1.40), HOOK_POS, look=TGT, ease=C.smooth), lens=(48, HOOK_LENS), fstop=2.4,
         focus=TGT)
finish_cam(cam, NF, a, sc)
