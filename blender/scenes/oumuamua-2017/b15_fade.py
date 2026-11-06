"""s15 WIDE 28 mm 'Within months, it was too faint to follow.' The rock recedes into the star field until it is one more
faint point (chip TOO FAINT FOR THE LARGEST TELESCOPES BY DEC 2017). Slow push-in that loses it."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=15)
o = oumuamua('Oumu', (0, 0, 0), L=40, NF=NF)
key_loc(o, [(0, (0, 120, 0)), (NF, (0, 40 * NF, 0))])
cam = C.Cam(clip_end=200000)
wide(cam, NF, C.push_in((0, -60, 6), (0, 4000, 0), amount=0.01), lens=28, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
