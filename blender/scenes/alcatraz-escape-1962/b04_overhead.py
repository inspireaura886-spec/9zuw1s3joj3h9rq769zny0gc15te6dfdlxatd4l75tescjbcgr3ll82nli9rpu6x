"""b04 (WIDE top, 'On June eleventh, nineteen sixty-two'): overhead of the three adjacent cells, roof off, a head and blanket in each; slow crane down."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 158, int)
sc = core.reset(); look(sc, vol=False, glare=0.35, vignette=0.28)
Wd.hdri('moonless_golf', strength=0.03)
m = mats()
for i, cx in enumerate((-1.55, 0.0, 1.55)):
    cell(cx, tag='T%d_' % i, head=True, roof=False, right_wall=(i == 2))
boxm('WalkFloor', (0, -1.6, -0.03), (6, 3.2, 0.06), m['floor'])
boxm('WalkWall', (0, -3.25, 0.5), (6, 0.1, 1.0), m['wall'])
Wd.area('TopSoft', (0, 1.2, 7.0), (0, 1.2, 0), color=(0.75, 0.82, 1.0), power=900, size=4.5)
Wd.spot('TopWarm', (1.6, -2.4, 4.5), (0, 1.3, 0.6), color=(1.0, 0.78, 0.5), power=500, size_deg=48, blend=0.7, radius=0.1)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.crane((0, -1.25, 8.4), (0, 1.3, 0), dz=-1.4), lens=35, fstop=8, roll=90, focus=Vector((0, 1.3, 0.6)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
