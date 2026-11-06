"""s02 WIDE 24 mm 'Witnesses said it made no sound.' Low angle from a north-Phoenix street: five separate steady lights in a
V glide south over the city grid; nothing joins them. Slow push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=1)
for k in range(5):
    house('H%d' % k, (-60 + k * 30, 40 + (k % 2) * 14, 0), yaw=(k * 7) % 20)
vee_lights('V', (0, 300, 650), NF, v=(0, 3.0, -0.2))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((10, -40, 1.7), (0, 420, 520), amount=0.06), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
