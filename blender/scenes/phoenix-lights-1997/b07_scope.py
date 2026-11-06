"""s07 WIDE 28 mm MOMENT 'Amateur astronomer Mitch Stanley aimed his telescope at the V.' A faceless figure at a tripod telescope in a dark yard; the five lights high in the sky (chip 8:30 PM SCOTTSDALE). Orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=5, city_center=(0, 6000, 0))
telescope('Scope', (0, 0, 0), yaw=10, alt_deg=60)
figure('Stanley', (-0.7, -0.4, 0), yaw=-20)
house('Home', (-14, -12, 0), yaw=8)
vee_lights('V', (200, 1200, 2600), NF, v=(-0.6, 1.5, 0), spread=70)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.orbit((0, 0, 0), r=9, a0=-130, a1=-100, h=(1.2, 1.8), look_h=2.4), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
