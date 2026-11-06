"""s13 WIDE 24 mm 'secret balloon trains built to hear Soviet atomic tests.' Dawn desert; a tall train (~120 m) of
neoprene balloons over radar reflectors and a sonde rises slowly. Crane UP along the train."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
desert(sun_elev=7, az=80, warmth='golden', strength=3.5, seed=21, scrub=60, haze=0.0015)
balloon_train('Train', (0, 60, 4), NF, n=14, spacing=9.0, rise=(0, 18))
cam = C.Cam(clip_end=20000)
wide(cam, NF, C.crane((-28, -10, 3), (0, 60, 30), dz=60, dlook=80), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
