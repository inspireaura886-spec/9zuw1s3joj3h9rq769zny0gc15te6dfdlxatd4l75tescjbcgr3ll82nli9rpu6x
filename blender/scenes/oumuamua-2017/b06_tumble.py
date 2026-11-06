"""s06 MEDIUM 35 mm REVEAL 'Its light flickered as it tumbled, end over end.' The rock tumbling in hard sunlight; its lit area
grows and shrinks (the light curve chip draws in Remotion). Orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=6)
oumuamua('Oumu', (0, 0, 0), L=40, NF=NF * 3)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.orbit((0, 0, 0), r=70, a0=-110, a1=-80, h=(10, 6)), lens=35, fstop=16, focus='Oumu')
go(cam, NF, a, sc, meter=NF // 2)
