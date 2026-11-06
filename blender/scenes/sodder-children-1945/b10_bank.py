"""s10 WIDE 28 mm REVEAL 'Later, the family found that ladder dumped down a bank, seventy-five feet away.' Flat winter daylight:
the ladder lying at the bottom of a brushy embankment; the ruin and chimney small at the top of the slope (chip 75 FT).
Crane DOWN onto the ladder."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
sod_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.25, bg_strength=0.45, tint=(0.8, 0.85, 0.9))
CN.sun(elev=18, az=160, warmth='noon', strength=1.4)
slope = Wd.terrain('Bank', size=120, res=80, height=1.0, scale=0.05, center=(0, 20, 0), seed=10, mat=bpy.data.materials['Frost'])
slope.rotation_euler[0] = math.radians(-14)
CN.scatter('dry_branches_medium_01', 50, (-20, 20, -4, 30), seed=10, scale=(1.0, 2.2))
CN.scatter('weed_plant_02', 40, (-20, 20, -4, 30), seed=11, scale=(1.0, 1.6))
ladder('Ladder', (-1.5, -2.2, -0.1), (2.2, 1.2, 0.0))
cyl('Chimney', (0, 24, 5.0), (0, 24, 11.5), 0.55, M.principled('Brick', base=(0.35, 0.16, 0.10), rough=0.85, grime=0.6), 4)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-6, -12, 7), (0.3, 0, 0), dz=-4, dlook=0), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
