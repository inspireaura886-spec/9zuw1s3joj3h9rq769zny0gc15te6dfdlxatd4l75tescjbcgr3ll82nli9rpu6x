"""mh370 b03 (WIDE 24 mm, VO 'At 1:19 a.m., the cockpit radioed:'): night area-control room, rows of workstations
with radar pictures, empty chairs, one lit console (hero). Slow crane DOWN from ceiling height. NF default 102."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 102, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
Wd.hdri('moonless_golf', strength=0.02)
control_room(NF, blips_hero=[((0.25, 0.10), (0.27, 0.16), 3.0)], size=(16, 16, 3.4), haze=0.01)
cam = C.Cam()
cam.shot(0, NF, C.dolly((3.6, -4.7, 3.05), (3.0, -4.4, 1.75), look=(0.2, 1.8, 0.7), look1=(0.0, 1.4, 0.95)), lens=24, fstop=5.6,
         focus=Vector((0, 0.18, 1.1)))
go(cam, NF, a, sc, meter=NF // 2, target=0.21)
