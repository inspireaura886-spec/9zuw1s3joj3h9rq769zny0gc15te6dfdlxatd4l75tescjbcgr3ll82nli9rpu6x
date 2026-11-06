"""s15 WIDE 24 mm LOOP 'Nobody explained it.' The empty lot at night: frost, a low memorial garden of bare shrubs where the
house stood, the road's edge; push toward the road for the dissolve into the s01 town photo."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
winter_night(NF, seed=15, moon=0.3)
CN.scatter('dry_branches_medium_01', 30, (-6, 6, -4, 4), seed=15, scale=(0.8, 1.4))
CN.ground('Road', 'asphalt_02', (8, 400), center=(0, -22, 0.02), tile_m=6.0)
bpy.data.objects['Road'].rotation_euler[2] = math.radians(90)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.push_in((0, 14, 1.7), (0, -22, 1.0), amount=0.25), lens=24, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
