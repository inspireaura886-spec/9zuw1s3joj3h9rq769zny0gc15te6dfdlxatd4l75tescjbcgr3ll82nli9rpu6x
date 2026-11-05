"""mh370 b04 (MEDIUM 35 mm, VO "'Good night, Malaysian three seven zero.'"): same room, new angle: gentle push in
on the lit hero workstation (quote card is added in Remotion). NF default 93."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 93, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
Wd.hdri('moonless_golf', strength=0.02)
control_room(NF, blips_hero=[((0.25, 0.10), (0.27, 0.16), 3.0)], size=(16, 16, 3.4), haze=0.01, t0=1.5)
cam = C.Cam()
cam.shot(0, NF, C.dolly((-1.5, -2.3, 1.62), (-1.05, -1.7, 1.48), look=(0.0, 0.2, 1.0)), lens=35, fstop=2.8,
         focus=Vector((0, 0.18, 1.1)))
go(cam, NF, a, sc, meter=NF // 2, target=0.21)
