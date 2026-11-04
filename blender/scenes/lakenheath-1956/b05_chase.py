"""lakenheath b05 (L7 'classified teleprinter message three days later broadly agreed'): scope, two blips: one steady
(fighter), one tailing it close; slow glide."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 171, int)
blips = [((0.40, -0.30), (-0.10, 0.10), 3.6), ((0.46, -0.33), (-0.04, 0.07), 3.6)]
sc = radar_set(NF, blips, t0=T0 + 0.9)
cam = C.Cam()
cam.shot(0, NF, C.dolly((-0.42, -0.70, 1.70), (-0.22, -0.58, 1.62), look=TGT, look1=(0.05, 0.05, 1.03)), lens=(36, 40), fstop=2.4, focus=TGT)
finish_cam(cam, NF, a, sc)
