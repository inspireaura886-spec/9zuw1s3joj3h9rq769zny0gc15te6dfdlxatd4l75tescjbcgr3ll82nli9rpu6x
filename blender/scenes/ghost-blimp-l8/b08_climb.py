"""s08 WIDE 24 mm 'then climb, and head for shore.' The blimp rises and swings east toward the hazy San Francisco coastline.
Crane UP following its climb."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
marine_day(NF, sun_elev=26, az=120, haze=0.0010)
coast = M.texture_set('Coast', 'forest_ground_04', scale=0.02, tint=(0.35, 0.36, 0.28), box=True)
Wd.terrain('Coast', size=12000, res=160, height=220, scale=0.0007, center=(0, 7500, -40), seed=4, mat=coast)
b = blimp('L8', (0, 300, 20), NF)
fly_keys(b, [(0, (-30, 300, 20), 60), (NF, (10, 380, 110), 85)])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-120, 120, 10), (0, 340, 60), dz=70, dlook=40), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
