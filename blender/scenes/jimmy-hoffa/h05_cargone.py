"""s05 (WIDE 28 mm, 'His car was found in the lot.'): high crane up over the lot, one car alone under a lamp."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 104, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
lot(cars=('lone',), phone=False, NF=NF)
cam = C.Cam(clip_end=2000)
cam.shot(0, NF, C.dolly((-12, -18, 2.5), (-6, -14, 14.0), look=(0, 5, 0.6), look1=(0, 5, 0.6)), lens=28, fstop=8, focus=Vector((0, 5, 0.8)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
