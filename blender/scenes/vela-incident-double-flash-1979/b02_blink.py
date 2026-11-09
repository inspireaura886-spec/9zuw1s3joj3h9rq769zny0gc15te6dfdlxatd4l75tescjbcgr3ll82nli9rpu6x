"""s02 WIDE 24 mm 'A blink, then a longer glow.' HOOK: night ocean from high altitude; a hard white blink on the far
horizon at 20 percent, then a slower second swell of light. Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
night(sea_z=0.0, NF=NF, key=0.06)
double_flash('Dbl', (0, 9000, 40), int(NF * 0.2), NF, k=6.0)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.push_in((0, -200, 900), (0, 9000, 40), amount=0.08), lens=24, fstop=16)
go(cam, NF, a, sc, meter=int(NF * 0.85), target=0.16)
