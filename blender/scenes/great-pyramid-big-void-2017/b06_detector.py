"""great-pyramid-big-void-2017 b06_detector (28 mm, crane down; VO "Detectors in the Queen's Chamber counted them."): Inside a gabled limestone chamber (Queen's Chamber stand-in): two detector stacks on the floor, LEDs, work lamp, dust.
NF default 89 = 7 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
stone_room('Queen', (5.2, 5.8, 4.7))
detector('DetA', (-1.2, 0.6, 0), yaw=8)
detector('DetB', (1.1, 1.2, 0), yaw=-12)
CN.practical('WorkLamp', (1.8, -2.2, 3.4), (0, 0.8, 0.4), power=120, cone=70)
Wd.fog(center=(0, 0, 2.4), size=(5, 5.6, 4.6), density=0.02, color=(1, 0.92, 0.8), anisotropy=0.5)
cam = C.Cam(clip_end=100)
ease_cam(cam, NF, C.crane((-1.9, -2.5, 2.6), (0, 0.8, 0.6), dz=-0.8, dlook=-0.1), 28, fstop=5.6, focus=3.0)
go(cam, NF, a, sc, meter=NF // 2)
