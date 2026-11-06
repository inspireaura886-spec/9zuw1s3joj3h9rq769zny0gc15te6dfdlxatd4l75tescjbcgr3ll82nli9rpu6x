"""s12 WIDE 35 mm 'Each light winks out at the same line: the Sierra Estrella mountains.' Tighter on the
ridge: the flares sink one by one and vanish behind the saw-tooth crest (chip SIERRA ESTRELLA). Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=9)
flare_row(NF, base=(0, 30000, 0), n=6, gap=900, alt=3000, fall=6.0, stagger=10)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-200, -400, 60), (200, -400, 60), look=(-300, 12000, 1000), look1=(300, 12000, 1000)), lens=35, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
