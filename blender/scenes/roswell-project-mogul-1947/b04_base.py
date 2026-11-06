"""s04 WIDE 28 mm 'The nearby air base put out a press release:' Roswell Army Air Field look: arched hangar row,
water tower, flagpole, low morning sun, light haze. Slow push-in down the apron."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
desert(sun_elev=16, az=150, warmth='golden', seed=8, scrub=0, haze=0.0016)
for k in range(3):
    hangar('Hangar%d' % k, (-70 + k * 55, 160, 0), yaw=0)
water_tower('WTower', (60, 120, 0))
us_flag_pole('Flag', (12, 60, 0))
boxm('Office', (25, 70, 3), (24, 10, 6), M.principled('OfficeW', base=(0.72, 0.68, 0.58), rough=0.8, grime=0.3))
cam = C.Cam(clip_end=20000)
wide(cam, NF, C.push_in((10, -40, 6), (0, 140, 8), amount=0.18), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
