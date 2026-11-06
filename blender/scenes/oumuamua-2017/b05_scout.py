"""s05 WIDE 28 mm "They named it Oumuamua: Hawaiian for scout." Pre-dawn on the summit: the dome against the first light,
cloud sea glowing below (chip 'OUMUAMUA = SCOUT; 1I/2017 U1). Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
haleakala(NF, seed=5)
CN.sun(elev=1, az=80, warmth='golden', strength=1.2, check=False)
dome('PS1', (0, 300, 95), r=9)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.orbit((0, 300, 95), r=48, a0=200, a1=225, h=(8, 10), look_h=8), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
