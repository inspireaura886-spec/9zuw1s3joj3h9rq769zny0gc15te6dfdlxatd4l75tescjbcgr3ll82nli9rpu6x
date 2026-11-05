"""s09 (40 mm, 'DNA showed a hair found in that car was his'): evidence bag with a hair strand under a desk lamp, slow dolly in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
lab()
cam = C.Cam()
cam.shot(0, NF, C.dolly((0.55, -0.95, 1.25), (0.15, -0.62, 1.12), look=(0.0, 0.02, 0.96), look1=(0.0, 0.02, 0.96)), lens=40, fstop=4.0, focus=Vector((0.0, 0.0, 0.97)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
