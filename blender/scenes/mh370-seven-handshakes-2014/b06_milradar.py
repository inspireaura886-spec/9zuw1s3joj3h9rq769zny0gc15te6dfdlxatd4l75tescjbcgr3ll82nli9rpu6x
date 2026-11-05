"""mh370 b06 (WIDE 28 mm, VO 'But military radar kept watching.'): military radar room, cooler light, raw primary
returns (no labels) on the scopes, one track moving west. Eased lateral dolly. No people. NF default 74."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 74, int)
sc = core.reset(); look(sc, vol=True, glare=0.45, vignette=0.28, lift=(0.97, 1.0, 1.06), gain=(0.98, 1.0, 1.03), sat=0.9)
Wd.hdri('moonless_golf', strength=0.02)
control_room(NF, blips_hero=[((0.35, -0.05), (0.05, 0.12), 3.5)], cool=True, size=(16, 12, 3.2), rows=2, per_row=6,
             hero_lit=False, seed=11, haze=0.014, t0=0.3)
cam = C.Cam()
cam.shot(0, NF, C.dolly((-4.6, -3.9, 1.75), (-2.2, -3.9, 1.62), look=(-1.6, 1.6, 1.0), look1=(0.6, 1.6, 1.0)), lens=28,
         fstop=4.0, focus=Vector((-0.5, 0.2, 1.1)))
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
