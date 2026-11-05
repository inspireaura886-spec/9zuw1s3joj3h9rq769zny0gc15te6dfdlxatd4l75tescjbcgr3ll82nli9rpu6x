"""s08 (WIDE 32 mm, 'There was still no body.'): empty witness stand from across the room."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 94, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
court()
cam = C.Cam()
cam.shot(0, NF, C.dolly((6.5, 3.0, 1.8), (3.2, 4.4, 1.7), look=(-5.6, 10.0, 1.4), look1=(-5.6, 10.0, 1.4)), lens=32, fstop=5.6, focus=Vector((-5.6, 10.2, 1.3)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
