"""s04 MEDIUM 35 mm 'Hundreds of photos. Hours of video.' A camcorder on a tripod on a patio table, its flip screen
glowing; the row of lights in the distance beyond. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
az_night(NF, seed=3)
boxm('Table', (0, 2, 0.74), (1.4, 0.9, 0.05), bpy.data.materials['Stucco'])
cam_body = boxm('Camcorder', (0, 2, 1.25), (0.12, 0.28, 0.14), bpy.data.materials['BlackEnamel'], 0.02)
boxm('Screen', (0.08, 1.98, 1.27), (0.01, 0.09, 0.07), glow_mat('ScreenM', color=(0.7, 0.8, 1.0), strength=2.5))
for k in range(3):
    cyl('Leg%d' % k, (0, 2, 1.15), (0.3 * math.cos(k * 2.09), 2 + 0.3 * math.sin(k * 2.09), 0.77), 0.012,
        bpy.data.materials['BlackEnamel'], 8)
flare_row(NF, base=(0, 30000, 0), n=8, gap=1100, alt=3000, fall=0.8)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-1.6, -0.6, 1.35), (-0.8, -0.9, 1.4), look=(0, 2.4, 1.3), look1=(0.1, 3.0, 1.4)), lens=35, fstop=5.6,
     focus='Camcorder')
go(cam, NF, a, sc, meter=NF // 2)
