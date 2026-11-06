"""usa-32-farrah-2026 b06_name (35 mm, slow orbit; VO 'It was called U S A thirty-two.'): MEDIUM-WIDE: the intact satellite with a stencilled USA 32 tag on the foil, camera arcing around it over the limb.
NF default 89 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=False, glare=0.35)
space(sun_az=80); earth()
root, parts = satellite('USA32', (0, 0, 0), spin_deg=0, NF=NF, stencil=True)
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.orbit((0, 0, 0), r=24, a0=-112, a1=-76, h=(3, 5), look_h=0.0), 35, fstop=8, focus=24.0)
go(cam, NF, a, sc, meter=NF // 2)
