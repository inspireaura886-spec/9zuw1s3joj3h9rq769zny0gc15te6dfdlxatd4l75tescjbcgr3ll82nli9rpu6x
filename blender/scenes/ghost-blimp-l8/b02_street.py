"""s02 MEDIUM 35 mm 'Its crew was gone.' The gondola resting on the street, half-deflated envelope draped above it,
bungalows either side, grey morning light. Crane DOWN toward the empty car."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=30, az=140, haze=0.004, sea=False, fog_h=80)
street('St', NF, length=120, houses=8)
b = blimp('L8', (0, 46, 7.7), NF, sag=[(0, 0.8), (NF, 0.9)], props=False, yaw=14)
cam = C.Cam()
wide(cam, NF, C.crane((-15, 14, 13), (0, 44, 2.5), dz=-8, dlook=0.5), lens=35, fstop=8, focus='L8')
go(cam, NF, a, sc, meter=NF // 2)
