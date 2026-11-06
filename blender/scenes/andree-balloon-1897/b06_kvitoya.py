"""s06 WIDE 24 mm TWIST 'In August nineteen thirty, Norwegian hunters landed on a bare island, Kvitoya, and found their
camp.' Sealer at anchor, a rowing boat drawn up on the stony beach, three faceless figures walking up, the ice cap behind
(chip 5 AUG 1930, Bratvaag). Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
kvitoya(NF, seed=2)
sealer('Bratvaag', (-80, -300, 0.3), yaw=70)
Md.boat('Rowboat', (12, 70, 0.4), length=6.0, cabin_light=False)
for k in range(3):
    f = figure('Hunter%d' % k, (20 + k * 4, 95 + k * 3, 0.6), yaw=-160 + k * 15)
    key_loc(f, [(0, (20 + k * 4, 95 + k * 3, 0.6)), (NF, (22 + k * 4, 104 + k * 3, 0.8))], interp='LINEAR')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-150, -110, 9), (-90, -125, 10), look=(10, 110, 14), look1=(20, 115, 14)), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
