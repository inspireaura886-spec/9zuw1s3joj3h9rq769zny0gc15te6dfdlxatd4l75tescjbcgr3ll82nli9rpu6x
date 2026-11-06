"""uss-omaha-spherical-uap-2019 b05_glide (28 mm, slow pan-dolly; VO 'It glided. It stopped. Then it sank toward the waves.'): Our IR recreation (monochrome): a black sphere glides left to right over warm-grey water, stops, eases down.
NF default 124 = 10 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 124, int)
sc = core.reset(); look(sc, vol=True, glare=0.2, sat=0.0, vignette=0.3)
ir_sea(NF)
sp = dark_sphere(ir=True)
f2 = sphere_path(sp, NF, x0=-70, x1=8, y=220, z=24, stop=0.4, sink=0.92)
cam = C.Cam(clip_end=8000)
ease_cam(cam, NF, C.dolly((-20, -10, 12), (-10, -10, 11), look=(-40, 220, 18), look1=(8, 220, 6)), 28, fstop=11, focus=230.0)
go(cam, NF, a, sc, meter=NF // 2)
