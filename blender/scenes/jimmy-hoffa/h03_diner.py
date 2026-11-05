"""s03 (WIDE 28 mm, 'to meet two reputed mobsters'): diner interior, empty booth, two untouched coffee cups, slow dolly in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 81, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
diner()
cam = C.Cam()
cam.shot(0, NF, C.dolly((-1.0, -6.5, 1.55), (3.0, -2.9, 1.28), look=(5.9, 0.0, 0.8), look1=(5.9, 0.0, 0.8)), lens=28, fstop=5.6, focus=Vector((5.9, 0.0, 0.82)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
