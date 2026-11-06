"""s11 WIDE 24 mm 'And the later lights? Watch the videos to the end.' The row of lights hanging over the city glow;
the camera cranes DOWN so the black ridge line rises into frame under them (chip 10 PM)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=8)
flare_row(NF, base=(0, 30000, 0), n=8, gap=1100, alt=3000, fall=1.2)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((0, -400, 60), (0, 12000, 1200), dz=-30, dlook=-450), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
