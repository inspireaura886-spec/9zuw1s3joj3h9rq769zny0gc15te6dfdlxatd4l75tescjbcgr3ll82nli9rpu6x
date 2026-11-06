"""s03 WIDE 28 mm 'It began with one blip' SCR-270-style dipole antenna on a coastal bluff before dawn, sea below,
trailer window glowing green. Eased dolly past the mast."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
mats()
Wd.hdri('qwantani_night_puresky', strength=0.12, bg_strength=0.4, rot=200, tint=(0.75, 0.85, 1.1), stars=0.3)
Wd.moon(direction=(0.3, 0.8, 0.3), strength=0.8)
gm = M.texture_set('Bluff', 'dry_ground_rocks', scale=0.2, tint=(0.3, 0.29, 0.26), box=True)
Wd.terrain('Bluff', size=500, res=120, height=4, scale=0.01, center=(0, -60, 30), seed=2, mat=gm)
boxm('Cliff', (0, 190, 14), (500, 6, 32), M.texture_set('CliffR', 'rocky_terrain_02', scale=0.15, tint=(0.3, 0.29, 0.27), box=True))
Wd.sea_plane(size=60000, z=0.0, rough=0.1, wave=0.2, frames=NF)
radar_antenna('Radar', (0, 60, 32), yaw=0)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-34, -10, 36), (-20, -16, 37), look=(0, 70, 46), look1=(2, 70, 47)), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
