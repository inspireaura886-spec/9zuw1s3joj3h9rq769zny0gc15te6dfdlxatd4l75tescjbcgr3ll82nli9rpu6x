"""taos b09 (WIDE): same bedroom from the foot of the bed, slow crane up and back; the blanket rises and falls, the glass keeps pulsing, nothing else moves. NF 86."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tc import *
a = core.args(); NF = arg(a, '--nf', 86, int)
sc = core.reset()
setup(sc, exposure=1.1, vol=True, glare=0.5, vignette=0.4)
Wd.hdri('moonless_golf', strength=0.02, bg_strength=0.0)
bedroom(NF)
CN.haze(center=(0, 0, 1.3), size=(5.2, 4.7, 2.6), density=0.012, color=(0.7, 0.78, 1.0), anisotropy=0.6, height_falloff=0.0)
cam = C.Cam(clip_end=100)
cam.shot(0, NF, C.dolly(Vector((1.0, -2.0, 0.9)), Vector((1.6, -2.1, 1.5)), look=Vector((0.5, 1.8, 0.7)), look1=Vector((0.3, 1.8, 0.7))), lens=24, fstop=6.0, focus=Vector((0.6, 1.3, 0.6)))
finish_cam(cam, NF, a, sc)
