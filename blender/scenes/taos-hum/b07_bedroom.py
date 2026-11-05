"""taos b07 (WIDE): night bedroom, moon through the window, sleeper under a blanket, glass of water on the nightstand pulsing; wide dolly then closer to the glass. NF 193."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tc import *
a = core.args(); NF = arg(a, '--nf', 193, int)
sc = core.reset()
setup(sc, exposure=1.1, vol=True, glare=0.5, vignette=0.4)
Wd.hdri('moonless_golf', strength=0.02, bg_strength=0.0)
bedroom(NF)
CN.haze(center=(0, 0, 1.3), size=(5.2, 4.7, 2.6), density=0.012, color=(0.7, 0.78, 1.0), anisotropy=0.6, height_falloff=0.0)
cam = C.Cam(clip_end=100)
S = 112
cam.shot(0, S, C.dolly(Vector((-2.15, -2.0, 1.45)), Vector((-1.45, -1.75, 1.4)), look=Vector((0.9, 1.3, 0.55)), look1=Vector((0.7, 1.4, 0.6))), lens=24, fstop=6.0, focus=Vector((0.9, 1.3, 0.55)))
cam.shot(S, NF, C.dolly(Vector((-1.1, 0.6, 0.95)), Vector((-0.7, 1.15, 0.82)), look=Vector((-0.42, 1.98, 0.63)), look1=Vector((-0.42, 1.98, 0.64))), lens=35, fstop=2.8, focus=Vector((-0.42, 1.98, 0.62)))
finish_cam(cam, NF, a, sc)
