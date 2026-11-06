"""s09 WIDE 28 mm 'On Ocean Beach, two fishermen grabbed its ropes. The gondola was empty.' Surf rolling in, the blimp
bumping low over the sand, two faceless figures hauling on its trailing lines (chip '~11:15 AM'). Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=40, az=150, haze=0.0025, sea=False, fog_h=120)
beach_set(NF)
b = blimp('L8', (0, 70, 9.0), NF, yaw=-15)
fly_keys(b, [(0, (2, 70, 9.4), -15), (NF // 3, (0, 68, 8.6), -14), (2 * NF // 3, (-1, 67, 9.2), -16), (NF, (-2, 66, 8.8), -15)])
for k, (x, y) in enumerate(((-5, 82), (6, 84))):
    figure('Fisher%d' % k, (x, y, 0.3), yaw=180 + (20 if k else -20), pose='reach')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((-8, 22, 3.2), (0, 72, 4.5), amount=0.22), lens=28, fstop=8, focus='L8')
go(cam, NF, a, sc, meter=NF // 2)
