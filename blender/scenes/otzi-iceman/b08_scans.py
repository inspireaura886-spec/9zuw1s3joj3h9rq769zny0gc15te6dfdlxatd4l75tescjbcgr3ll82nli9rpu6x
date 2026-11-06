"""s08 MEDIUM 30 mm MOMENT 'Radiologist Paul Gostner spotted it in two thousand one, after a decade of scans had missed it.' A long
corridor of lightboxes with archived films; one faceless figure in a white coat stops at the last box. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); alp_mats()
room(size=(14, 3, 3.0), wood_walls=False, window=False, sun_power=0, seed=8)
for k in range(9):
    x = -6 + 1.4 * k
    lightbox('LB%d' % k, (x, 1.4, 1.55), w=0.8, h=0.6, strength=1.6 + 0.2 * k)
    xray_film('Film%d' % k, (x, 1.4, 1.55), point=(k == 8), glow=0.8)
g = figure('Gostner', (5.4, 0.6, 0), yaw=180, coat=M.principled('Coat', base=(0.85, 0.86, 0.88), rough=0.7))
key_loc(g, [(0, (3.0, 0.6, 0)), (int(NF * 0.6), (5.2, 0.6, 0))])
cam = C.Cam(clip_end=200)
wide(cam, NF, C.dolly((-2.0, -1.0, 1.6), (2.5, -1.0, 1.6), look=(0, 1.4, 1.45), look1=(5.2, 1.4, 1.5)), lens=30, fstop=4)
go(cam, NF, a, sc, meter=NF // 2)
