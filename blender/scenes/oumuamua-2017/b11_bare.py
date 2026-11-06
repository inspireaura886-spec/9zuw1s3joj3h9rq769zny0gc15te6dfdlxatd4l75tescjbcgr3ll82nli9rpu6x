"""s11 WIDE 28 mm REVEAL 'But telescopes saw no tail, no dust, no gas.' The same framing as s10 but with 'Oumuamua: bare rock,
black sky, nothing streaming from it (chip SPITZER: NO GAS DETECTED). Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=10, sun_dir=(-1, 0, 0.05))
oumuamua('Oumu', (0, 0, 0), L=40, NF=NF)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.push_in((-20, -270, 30), (40, 0, 0), amount=0.3), lens=28, fstop=16, focus='Oumu')
go(cam, NF, a, sc, meter=NF // 2)
