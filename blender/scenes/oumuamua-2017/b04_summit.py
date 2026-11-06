"""s04 WIDE 24 mm MOMENT 'A telescope on Haleakala, a volcano in Hawaii, caught a faint dot moving too fast.' Night on the
summit above a sea of cloud: two white domes, slits open, stars overhead (chip PAN-STARRS1, ROBERT WERYK, 19 OCT 2017).
Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
haleakala(NF, seed=4)
dome('PS1', (0, 300, 95), r=9)
dome('Other', (-60, 380, 92), r=12, slit=False)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((60, 120, 104), (0, 300, 108), amount=0.12), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
