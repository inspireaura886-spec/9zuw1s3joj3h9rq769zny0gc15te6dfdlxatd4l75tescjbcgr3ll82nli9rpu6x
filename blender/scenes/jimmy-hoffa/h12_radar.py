"""s12 (WIDE 28 mm, 'Nothing of evidentiary value.'): ground-radar cart on dirt under the bridge deck, slow push."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 94, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
bridge()
gpr_cart()
cam = C.Cam(clip_end=3000)
cam.shot(0, NF, C.dolly((21.4, -7.6, 1.8), (23.0, -5.0, 1.5), look=(23.5, 0.5, 2.7), look1=(23.5, 0.5, 2.4)), lens=28, fstop=5.6, focus=Vector((23.2, 0.4, 1.0)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
