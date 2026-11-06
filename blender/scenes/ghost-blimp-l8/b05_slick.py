"""s05 WIDE 24 mm TWIST 'Off the Farallon Islands, they radioed: investigating a suspicious oil slick. Stand by.' A ragged
dark slick on the swell, the blimp banking round it, Farallon rocks in the haze behind (chip '7:38 AM'). Orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=16, az=110, haze=0.0011)
farallons(center=(0, 2300, 0))
oil_slick('Slick', (0, 0, 0), size=280)
b = blimp('L8', (120, 0, 90), NF)
keys = []
for k in range(5):
    t = k / 4
    a_ = math.radians(-20 + 110 * t)
    keys.append((int(NF * t), (120 * math.cos(a_), 120 * math.sin(a_), 90 - 25 * t), math.degrees(a_) + 180))
fly_keys(b, keys)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.orbit((0, 0, 30), r=330, a0=-110, a1=-80, h=(80, 70), look_h=20), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
