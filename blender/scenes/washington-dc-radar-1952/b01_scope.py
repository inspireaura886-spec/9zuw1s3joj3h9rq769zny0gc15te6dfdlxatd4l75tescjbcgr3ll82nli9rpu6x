"""dc-radar b01 HOOK (L1 'Seven unknown blips crossed the White House on radar. And the radar was working.'):
frame 0 = the radar scope with SEVEN bright blips (named object on frame 1). Blips drift toward the scope centre.
Slow push-in, then a slow lateral glide across the console ('the radar was working')."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 150, int)
blips = [(p0, p1, 3.6) for p0, p1 in zip(SEVEN0, SEVEN1)]
sc = radar_set(NF, blips)
cut = arg(a, '--cut', int(NF * 0.55), int)
cam = C.Cam()
cam.shot(0, cut, C.dolly(HOOK_POS, (0.14, -0.50, 1.47), look=TGT), lens=(HOOK_LENS, 44), fstop=2.4, focus=TGT)
cam.shot(cut, NF, C.dolly((-0.55, -0.85, 1.62), (-0.30, -0.80, 1.55), look=(0.0, 0.05, 1.0)), lens=(32, 34),
         fstop=2.6, focus=TGT)
finish_cam(cam, NF, a, sc)
