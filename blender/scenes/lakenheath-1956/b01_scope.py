"""lakenheath b01 HOOK (L1 'A military radar scope tracked an unknown target at up to 4,000 mph'): one very fast blip
streaks across the PPI while the beam sweeps. Frame 0 = hook framing, slow push-in then glide."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 171, int)
blips = [((0.45, -0.38), (-0.30, 0.30), 3.8), ((0.30, 0.25), (0.24, 0.20), 3.0)]
sc = radar_set(NF, blips)
cut = arg(a, '--cut', int(NF * 0.6), int)
cam = C.Cam()
cam.shot(0, cut, C.dolly(HOOK_POS, (0.14, -0.50, 1.47), look=TGT), lens=(HOOK_LENS, 44), fstop=2.4, focus=TGT)
cam.shot(cut, NF, C.dolly((-0.55, -0.85, 1.62), (-0.30, -0.80, 1.55), look=(0.0, 0.05, 1.0)), lens=(32, 34), fstop=2.6, focus=TGT)
finish_cam(cam, NF, a, sc)
