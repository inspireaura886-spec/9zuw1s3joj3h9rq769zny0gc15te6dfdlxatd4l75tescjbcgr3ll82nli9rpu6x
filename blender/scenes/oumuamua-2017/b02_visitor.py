"""s02 WIDE 28 mm 'A visitor from another star, passing through our solar system.' A small reddish elongated rock crosses a
dense star field, hard sunlight from frame left (illustrative scale). Follow (dolly + pan)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=2)
o = oumuamua('Oumu', (0, 0, 0), L=40, NF=NF)
key_loc(o, [(0, (0, 0, 0)), (NF, (0, 3.0 * NF, 0))], interp='LINEAR')
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.follow('Oumu', (-160, -60, 20), (-150, 3.0 * NF - 160, 26)), lens=28, fstop=16, focus='Oumu')
go(cam, NF, a, sc, meter=NF // 2)
