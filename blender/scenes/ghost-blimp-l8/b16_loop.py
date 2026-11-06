"""s16 WIDE 28 mm LOOP 'The two men were never found. Nobody explained it.' Looking up past rooftops at the blimp hanging
low over the city, as in the 1942 NARA photo; push-in ends on that composition for the dissolve into s01."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=32, az=140, haze=0.003, sea=False, fog_h=120)
street('St', NF, length=160, houses=12)
b = blimp('L8', (6, 80, 34), NF, sag=[(0, 0.35), (NF, 0.4)], props=False, yaw=-25)
fly_keys(b, [(0, (6, 80, 34), -25), (NF, (2, 82, 33), -23)])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((-2, 8, 1.8), (4, 80, 30), amount=0.12), lens=28, fstop=11, focus='L8')
go(cam, NF, a, sc, meter=NF // 2)
