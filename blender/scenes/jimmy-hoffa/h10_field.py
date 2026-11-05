"""s10 (WIDE 30 mm, 'the FBI dug up a field near Detroit. Nothing.'): open trench, excavator, orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 122, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
field()
cam = C.Cam(clip_end=3000)
cam.shot(0, NF, C.orbit((0, 0, -0.5), r=30, a0=238, a1=285, h=(10.0, 12.5), look_h=0.0), lens=30, fstop=8, focus=Vector((0, 0, -1.0)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
