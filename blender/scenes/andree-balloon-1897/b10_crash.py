"""s10 WIDE 28 mm 'The photos showed the balloon down after about two days.' The downed balloon sagging on the pack ice,
basket tipped, lines in the snow, two faceless figures beside it (as in Strindberg's photo). Orbit 45 deg."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
arctic(NF, sun_elev=5, az=220, haze=0.0014, seed=10, floes=40)
balloon('Ornen', (0, 0, 0), NF, sag=1.0)
figure('M1', (14, -8, 0), yaw=200)
figure('M2', (17, -5, 0), yaw=160)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.orbit((0, 0, 4), r=48, a0=-115, a1=-70, h=(5, 7), look_h=1.0), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
