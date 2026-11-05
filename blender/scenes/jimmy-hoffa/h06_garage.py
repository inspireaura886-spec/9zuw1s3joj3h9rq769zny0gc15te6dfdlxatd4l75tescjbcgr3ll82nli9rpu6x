"""s06 (WIDE 28 mm, 'police dogs picked up his scent in a different car'): police garage, sedan under work lights, evidence tape, orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 125, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
garage()
cam = C.Cam()
cam.shot(0, NF, C.orbit((0, 0, 0), r=8.0, a0=215, a1=262, h=(3.1, 3.5), look_h=0.7), lens=28, fstop=8, focus=Vector((0, 0, 0.8)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
