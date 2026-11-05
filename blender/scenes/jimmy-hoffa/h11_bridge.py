"""s11 (WIDE 24 mm, 'under a New Jersey bridge'): steel truss bridge at dusk, side-on, slow push."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 91, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
bridge()
cam = C.Cam(clip_end=3000)
cam.shot(0, NF, C.push_in((0, -72, 7.5), (0, 0, 9.5), amount=0.28), lens=24, fstop=8, focus=Vector((0, 0, 9)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
