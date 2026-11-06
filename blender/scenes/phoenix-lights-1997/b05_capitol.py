"""s05 WIDE 28 mm "Arizona's governor later called it otherworldly." The State Capitol stand-in, its
copper dome lit, the night sky above (quote as an attributed chip). Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=4, city_center=(0, 4000, 0))
capitol('Capitol', (0, 0, 0))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.orbit((0, 0, 0), r=95, a0=-120, a1=-100, h=(6, 9), look_h=14), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
