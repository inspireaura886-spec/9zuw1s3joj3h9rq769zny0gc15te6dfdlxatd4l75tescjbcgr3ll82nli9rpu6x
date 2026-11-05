"""s02 (WIDE 28 mm, VO 'Then he was gone.'): empty restaurant lot at dusk, one maroon 1970s sedan under a lamp, crane DOWN."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 96, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
lot(cars=('lone',), phone=False, NF=NF)
cam = C.Cam(clip_end=2000)
cam.shot(0, NF, C.crane((-14, -20, 11.0), (0, 5, 0.8), dz=-7.5, dlook=0), lens=28, fstop=8, focus=Vector((0, 5, 0.8)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
