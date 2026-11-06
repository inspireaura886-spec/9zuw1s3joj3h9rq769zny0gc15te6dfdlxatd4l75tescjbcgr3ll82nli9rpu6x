"""s03 WIDE 28 mm 'Later, a row of lights seemed to hang over the city.' Three faceless figures on a
backyard wall look south; the 10 pm row hangs above the city glow; ridge black on the horizon. Crane UP over them."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=2)
boxm('Wall', (0, 6, 0.8), (14, 0.3, 1.6), bpy.data.materials['Stucco'])
for k in range(3):
    figure('W%d' % k, (-2 + k * 1.9, 4.6, 0), yaw=180 + (k - 1) * 8)
flare_row(NF, base=(0, 30000, 0), n=8, gap=1100, alt=3000, fall=0.8, stagger=0)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((3, -6, 1.4), (0, 9000, 900), dz=3.5, dlook=200), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
