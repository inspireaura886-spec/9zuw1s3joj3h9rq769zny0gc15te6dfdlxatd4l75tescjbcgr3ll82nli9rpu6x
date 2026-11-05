"""s07 (WIDE 28 mm, 'declared legally dead'): empty courtroom, dolly down the aisle toward the bench."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 99, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
court()
cam = C.Cam()
cam.shot(0, NF, C.dolly((0, -12.0, 2.3), (0, -4.5, 2.0), look=(0, 10.5, 1.9), look1=(0, 10.5, 1.9)), lens=28, fstop=8, focus=Vector((0, 10.5, 1.9)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
