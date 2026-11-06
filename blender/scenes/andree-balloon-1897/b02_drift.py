"""s02 WIDE 24 mm 'and vanished for thirty-three years.' A tiny balloon drifting away over endless pack ice into the
haze. Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
arctic(NF, sun_elev=5, az=200, haze=0.0016, seed=1)
b = balloon('Ornen', (200, 1300, 60), NF, ropes=False)
fly_line(b, NF, (200, 1300, 60), (0.15, 0.6, 0))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, -40, 7), (200, 1320, 70), amount=0.05), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
