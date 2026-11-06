"""s10 WIDE 28 mm 'It bounced off a cliff, lost a depth charge,' Grassy cliff top over the surf; the blimp brushes the
edge and a depth charge drops from the car to the rocks below. Lateral dolly from seaward."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=42, az=160, haze=0.0015, ocean_center=(0, -300, 0))
top = M.texture_set('CliffTop', 'forest_ground_04', scale=0.1, tint=(0.4, 0.42, 0.3), box=True)
Wd.terrain('Top', size=800, res=120, height=4, scale=0.01, center=(0, 400, 40), seed=5, mat=top)
boxm('Face', (0, 0, 19), (800, 8, 42), M.texture_set('Rock', 'rocky_terrain_02', scale=0.08, tint=(0.42, 0.38, 0.32), box=True))
b = blimp('L8', (0, -30, 52), NF, yaw=10)
fly_keys(b, [(0, (-10, -40, 54), 10), (NF // 2, (0, -2, 49.5), 14), (NF, (8, 30, 55), 18)])
dc = cyl('DepthCharge', (0, 0, 0), (0.7, 0, 0), 0.23, M.principled('DCM', base=(0.12, 0.13, 0.12), rough=0.5, metal=0.6), 20)
f0 = int(NF * 0.45)
key_loc(dc, [(0, (0, -6, 42.5)), (f0, (0, -6, 42.5)), (f0 + 26, (1.0, -9, 1.0)), (NF, (1.0, -9, 0.6))])
dc.hide_render = True
dc.keyframe_insert('hide_render', frame=0)
dc.hide_render = False
dc.keyframe_insert('hide_render', frame=f0)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-90, -150, 22), (-50, -160, 24), look=(0, -10, 40), look1=(6, 0, 38)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
