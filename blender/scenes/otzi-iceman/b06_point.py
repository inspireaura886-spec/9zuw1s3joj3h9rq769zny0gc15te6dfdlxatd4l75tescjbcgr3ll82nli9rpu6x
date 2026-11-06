"""s06 CLOSE 35 mm TWIST 'A flint arrowhead.' The film fills frame: ribs, shoulder blade, and a small bright triangle under it
that brightens slightly. Push-in (accent close-up)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); alp_mats()
room(size=(6, 5, 3.0), wood_walls=False, window=False, sun_power=0, seed=6)
lightbox('LB', (0.0, 2.4, 1.5), strength=2.5)
pt = xray_film('Film', (0.0, 2.4, 1.5), point=True)
key_strength(pt.data.materials[0], [(0, 3.0), (int(NF * 0.5), 9.0)])
cam = C.Cam(clip_end=200)
wide(cam, NF, C.push_in((0.1, 1.85, 1.56), (0.122, 2.354, 1.56), amount=0.35), lens=35, fstop=4, focus=Vector((0.122, 2.354, 1.56)))
go(cam, NF, a, sc, meter=NF // 2)
