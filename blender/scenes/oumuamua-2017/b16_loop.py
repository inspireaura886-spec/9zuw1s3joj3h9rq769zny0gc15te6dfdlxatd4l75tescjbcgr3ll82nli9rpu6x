"""s16 MEDIUM 35 mm LOOP 'Nobody explained it.' The rock large in frame against the stars, lit from one side, the framing of
the ESO artist's impression in s01; push-in for the dissolve."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=2)
oumuamua('Oumu', (0, 0, 0), L=40, NF=NF * 2)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.push_in((-24, -62, 8), (0, 0, 0), amount=0.12), lens=35, fstop=16, focus='Oumu')
go(cam, NF, a, sc, meter=NF // 2)
