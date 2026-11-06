"""s15 WIDE 28 mm 'Mogul was secret. The weather balloon stood in.' Dawn launch site: faceless crew silhouettes along
the train line, an army truck, the balloons lifting. Eased dolly L->R."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
desert(sun_elev=5, az=85, warmth='golden', strength=3.2, seed=23, scrub=40, haze=0.002)
balloon_train('Train', (6, 40, 3), NF, n=12, spacing=8.0, rise=(0, 4))
for k in range(4):
    figure('Crew%d' % k, (-4 + k * 2.6, 34 + k * 1.5, 0), yaw=20 + k * 10, pose='reach' if k % 2 else 'stand',
           mat=bpy.data.materials.get('OliveDrab'))
boxm('Truck', (-14, 44, 1.3), (2.4, 6, 2.2), bpy.data.materials['OliveDrab'], 0.05)
cam = C.Cam(clip_end=20000)
wide(cam, NF, C.dolly((-18, 8, 2.2), (-8, 6, 2.4), look=(0, 40, 6), look1=(4, 40, 10)), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
