"""s15 WIDE 28 mm LOOP 'Nobody explained it.' Back on the pack ice at eye height: the downed balloon with two figures beside
it, the composition of Strindberg's 1897 photo; push-in ends on it for the dissolve into s01."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
arctic(NF, sun_elev=5, az=220, haze=0.0014, seed=10, floes=40)
balloon('Ornen', (0, 0, 0), NF, sag=1.0)
figure('M1', (14, -8, 0), yaw=200)
figure('M2', (17, -5, 0), yaw=160)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((26, -44, 1.7), (2, 0, 4), amount=0.15), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
