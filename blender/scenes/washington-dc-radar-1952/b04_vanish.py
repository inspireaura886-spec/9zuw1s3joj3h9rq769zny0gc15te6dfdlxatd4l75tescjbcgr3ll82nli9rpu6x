"""dc-radar b04 (L3b 'Every blip vanished.' + L4 'The jets left. The blips came back.'): same scope from a wide
over-the-console angle; all seven blips fade out on 'vanished', the empty scope sweeps, they return on 'back'."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 140, int)
fv = arg(a, '--vanish', 18, int); fb = arg(a, '--back', 110, int)
vis = [(0, 1.0), (fv, 1.0), (fv + 5, 0.0), (fb - 2, 0.0), (fb + 4, 1.0), (NF, 1.0)]
blips = [(p1, (p1[0] - 0.02, p1[1] + 0.03), 3.6, vis) for p1 in SEVEN1]
sc = radar_set(NF, blips, t0=T0 + 0.7)
cam = C.Cam()
cam.shot(0, NF, C.dolly((-0.42, -0.70, 1.70), (-0.22, -0.58, 1.62), look=TGT, look1=(0.05, 0.05, 1.03)),
         lens=(36, 40), fstop=2.4, focus=TGT)
finish_cam(cam, NF, a, sc)
