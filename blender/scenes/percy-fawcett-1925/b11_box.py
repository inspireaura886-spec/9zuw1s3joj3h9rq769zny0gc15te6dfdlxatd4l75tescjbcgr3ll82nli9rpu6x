"""s11 MEDIUM 30 mm 'A chief later handed over bones said to be his.' Riverbank: a small closed wooden box passes from one
faceless figure to another beside a dugout canoe. Nothing inside is shown. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=11, n_trees=50, n_palms=12, area=(-90, 90, -10, 160), lane=lambda x, y: on_river(x, y, 24, 6, cx=0) or (abs(x) < 10 and y < 16), sun_elev=18, az=140, haze=0.008)
river('River', -40, 200, width=24, bend=6)
canoe = M.principled('Dugout', base=(0.22, 0.14, 0.08), rough=0.7, grime=0.4)
sphere('Canoe', (13.5, 4, -0.05), 1.0, canoe, 24, scale=(0.5, 4.0, 0.35))
box = boxm('Box', (15.6, 3.6, 1.05), (0.45, 0.3, 0.28), M.texture_set('BoxW', 'wood_table_worn', scale=2.0, box=True), bev=0.01)
key_loc(box, [(0, (15.6, 3.6, 1.05)), (int(NF * 0.7), (16.6, 3.6, 1.05))])
figure('Chief', (15.0, 3.5, 0), yaw=-90, mat=M.principled('SkinC', base=(0.20, 0.12, 0.08), rough=0.6), pose='reach')
figure('Officer', (17.3, 3.6, 0), yaw=90, coat=bpy.data.materials['Khaki'], pose='reach')
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((11.5, -5, 1.5), (14.5, -5, 1.5), look=(15.6, 3.6, 1.1), look1=(16.4, 3.6, 1.1)), lens=30, fstop=5.6)
go(cam, NF, a, sc, meter=NF // 2)
