"""great-pyramid-big-void-2017 b13_blocks (35 mm, lateral dolly; VO 'The big one is different. It sits deep inside millions of blocks.'): Raking dawn light across a wall of jittered limestone blocks, slow sideways move (medium, texture accent).
NF default 147 = 12 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 147, int)
sc = core.reset(); look(sc, vol=False, glare=0.3)
CN.hdri_sun('qwantani_dawn_puresky', sun_az=10, strength=0.6)
CN.sun(elev=8, az=10, warmth='golden', strength=4.0, check=False)
block_wall(nx=18, nz=9, origin=(-11, 0, 0))
CN.ground('Sand', 'dry_ground_rocks', (200, 200), tile_m=4.0, tint=(1.0, 0.8, 0.58))
cam = C.Cam(clip_end=500)
ease_cam(cam, NF, C.dolly((-3, -9, 3.6), (3, -9, 4.0), look=(-1, 0, 4.4), look1=(3, 0, 4.6)), 35, fstop=8, focus=9.0)
go(cam, NF, a, sc, meter=NF // 2)
