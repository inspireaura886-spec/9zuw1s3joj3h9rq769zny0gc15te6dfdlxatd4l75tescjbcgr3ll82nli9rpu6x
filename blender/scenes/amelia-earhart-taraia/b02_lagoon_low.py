"""b02 (WIDE 28 mm, VO 'sitting in a Pacific lagoon'): low oblique over the lagoon toward the pale patch on the sandspit, palms on the far rim. Eased dolly forward."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 62, int)
sc = core.reset(); look(sc, vol=False, glare=0.3, vignette=0.2)
day_world(sun_az=215, elev=30, strength=5.0)
at = Atoll(); at.build(NF=NF)
lx, ly = at.spit_center()
taraia_shape((lx + 6, ly), rot_deg=18, scale=1.0, z=1.05)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((lx - 300, ly - 70, 15), (lx - 215, ly - 45, 12), look=(lx + 5, ly, 2.5), look1=(lx + 5, ly, 2.5)), lens=28, fstop=11, focus=Vector((lx, ly, 1.0)))
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
