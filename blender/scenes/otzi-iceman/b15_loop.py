"""s15 MEDIUM 28 mm LOOP 'Nobody explained it.' The flint tools on a museum plinth (dagger blade, arrowheads, scraper) in the
s01 photo's layout; push-in for the dissolve into s01."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
mats(); alp_mats()
room(size=(6, 5, 3.0), wood_walls=False, window=False, sun_power=0, seed=15)
boxm('Plinth', (0, 0, 0.5), (0.9, 0.6, 1.0), M.principled('PlinthM', base=(0.12, 0.12, 0.13), rough=0.6))
for k, (x, y, s, rz) in enumerate(((-0.2, 0.05, 0.07, 0.2), (-0.05, -0.05, 0.04, -0.3), (0.06, 0.06, 0.045, 0.5), (0.2, -0.04, 0.03, 0.1))):
    flint_point('Tool%d' % k, (x, y, 1.008), size=s, rot=(0, 0, rz))
CN.practical('Key', (0.4, -0.5, 1.9), (0, 0, 1.0), kelvin_rgb=(1.0, 0.9, 0.8), power=45, cone=35)
cam = C.Cam(clip_end=200)
wide(cam, NF, C.push_in((0.0, -0.75, 1.45), (0, 0, 1.0), amount=0.25), lens=28, fstop=4, focus=Vector((0, 0, 1.01)))
go(cam, NF, a, sc, meter=NF // 2)
