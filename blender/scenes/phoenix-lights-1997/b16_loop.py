"""s16 WIDE 24 mm LOOP 'Believers still repeat one line: Nobody explained it.' Back on the backyard: the row of lights
hanging over the city glow, the composition of s01; push-in ends on the lights for the dissolve into the s01 photo."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=12)
boxm('Wall', (0, 6, 0.8), (14, 0.3, 1.6), bpy.data.materials['Stucco'])
flare_row(NF, base=(0, 30000, 0), n=8, gap=1100, alt=3000, fall=0.8)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, -6, 1.6), (0, 30000, 2900), amount=0.0004), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
