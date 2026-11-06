"""s07 CLOSE 50 mm accent 'It may be ten times longer than wide.' Grazing along the rock's length from one end to the other,
long shadows in the craters (chip UP TO ~400 M, NASA; SHAPE UNCERTAIN). Dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=7, sun_dir=(-0.2, 1, 0.25))
oumuamua('Oumu', (0, 0, 0), L=40, NF=NF, tumble=False)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.dolly((-16, -9, 3), (14, -9, 3), look=(-12, 0, 0), look1=(12, 0, 0)), lens=50, fstop=11, focus='Oumu')
go(cam, NF, a, sc, meter=NF // 2)
