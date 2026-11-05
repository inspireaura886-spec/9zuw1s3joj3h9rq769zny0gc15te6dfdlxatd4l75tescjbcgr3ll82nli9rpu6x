"""s04 (WIDE 30 mm, 'From a pay phone, he called his wife'): pay phone on a post near the building, two dark sedans far behind, push in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 116, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
lot(cars=('far2',), phone=True, NF=NF)
Wd.point('PhoneKey', (-4.2, 6.2, 2.0), color=(0.9, 0.95, 1.0), power=260, radius=0.2)
cam = C.Cam(clip_end=2000)
cam.shot(0, NF, C.dolly((-1.2, 0.5, 1.55), (-2.6, 2.7, 1.5), look=(-6.6, 10.2, 1.3), look1=(-6.6, 10.2, 1.3)), lens=30, fstop=5.6, focus=Vector((-5.5, 7.5, 1.4)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
